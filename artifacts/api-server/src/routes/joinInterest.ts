/**
 * POST /api/join-interest
 *
 * Stage 1 expression-of-interest submission for individuals and organizations.
 *
 * Duplicate / upsert behaviour (atomic, row-locked transaction):
 *   - No existing record        → INSERT  → 201 { status: "received" }
 *   - Existing, status pending|reviewed → UPDATE (status unchanged) → 200 { status: "updated" }
 *   - Existing, status converted        → NO modification → 200 { status: "updated" } (same safe shape, does not reveal account existence)
 *   - Existing, status archived         → Same as converted (no restore in Stage 1; document only)
 *
 * A unique index on email_normalized is the final guarantor against duplicate
 * rows even if concurrent requests bypass the transaction check.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { joinInterestsTable } from "@workspace/db/schema";
import {
  JOINABLE_GROUP_SET,
  CATEGORIES_BY_GROUP,
  SECTOR_SLUG_SET,
  PROGRAM_SLUG_SET,
  JOINING_AS_SET,
  CONSENT_VERSION,
  type JoinableGroup,
} from "@workspace/shared";
import { sendError } from "../lib/errorResponse";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";

const router: IRouter = Router();
const limiter = createRateLimiter();

// ---------------------------------------------------------------------------
// Field length limits (published in the endpoint contract)
// ---------------------------------------------------------------------------
const LIMITS = {
  fullName: 120,
  email: 254,
  country: 90,
  city: 90,
  organizationName: 160,
  contactRole: 120,
  audienceGroup: 60,
  category: 60,
  lookingFor: 300,
};

// ---------------------------------------------------------------------------
// Plain typed validator
// ---------------------------------------------------------------------------
type ValidationResult =
  | { ok: true; data: ValidatedPayload }
  | { ok: false; fields: Record<string, string>; message: string };

interface ValidatedPayload {
  fullName: string;
  emailNormalized: string;
  country: string;
  city: string | null;
  joiningAs: string;
  audienceGroup: string;
  category: string;
  organizationName: string | null;
  contactRole: string | null;
  sectorSlugs: string[] | null;
  programSlugs: string[] | null;
  notifyOpportunities: boolean;
  lookingFor: string | null;
  consentAccepted: boolean;
}

function validateJoinInterest(body: unknown): ValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, fields: {}, message: "Malformed payload." };
  }

  const raw = body as Record<string, unknown>;
  const fields: Record<string, string> = {};

  // Helper: require a string field, trim, check max length
  function requireString(
    key: string,
    maxLen: number,
    target: Record<string, unknown>,
  ): string | null {
    const val = target[key];
    if (val === undefined || val === null || val === "") {
      fields[key] = `${key} is required.`;
      return null;
    }
    if (typeof val !== "string") {
      fields[key] = `${key} must be a string.`;
      return null;
    }
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      fields[key] = `${key} is required.`;
      return null;
    }
    if (trimmed.length > maxLen) {
      fields[key] = `${key} must be at most ${maxLen} characters.`;
      return null;
    }
    return trimmed;
  }

  // Helper: optional string field
  function optionalString(
    key: string,
    maxLen: number,
    target: Record<string, unknown>,
  ): string | null {
    const val = target[key];
    if (val === undefined || val === null || val === "") return null;
    if (typeof val !== "string") {
      fields[key] = `${key} must be a string.`;
      return null;
    }
    const trimmed = val.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > maxLen) {
      fields[key] = `${key} must be at most ${maxLen} characters.`;
      return null;
    }
    return trimmed;
  }

  // 1. Trim + required string fields
  const fullName = requireString("fullName", LIMITS.fullName, raw);
  const emailRaw = requireString("email", LIMITS.email, raw);
  const country = requireString("country", LIMITS.country, raw);
  const city = optionalString("city", LIMITS.city, raw);
  const joiningAsRaw = requireString("joiningAs", 20, raw);
  const audienceGroupRaw = requireString(
    "audienceGroup",
    LIMITS.audienceGroup,
    raw,
  );
  const categoryRaw = requireString("category", LIMITS.category, raw);
  const lookingFor = optionalString("lookingFor", LIMITS.lookingFor, raw);

  // 2. Normalize email
  const emailNormalized = emailRaw ? emailRaw.toLowerCase() : null;

  // 3. Email format
  if (emailNormalized !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      fields["email"] = "A valid email address is required.";
    }
  }

  // 4. consentAccepted must be exactly boolean true
  if (raw["consentAccepted"] !== true) {
    fields["consentAccepted"] = "Consent must be accepted.";
  }

  // 5. joiningAs enum
  if (joiningAsRaw !== null && !JOINING_AS_SET.has(joiningAsRaw)) {
    fields["joiningAs"] =
      "joiningAs must be one of: individual, organization.";
  }

  // 6. audienceGroup enum
  if (audienceGroupRaw !== null && !JOINABLE_GROUP_SET.has(audienceGroupRaw)) {
    fields["audienceGroup"] =
      "audienceGroup must be one of: creative-cultural, business-innovation, community-impact.";
  }

  // 7. category must be valid for the selected audienceGroup (distinct error)
  if (
    audienceGroupRaw !== null &&
    JOINABLE_GROUP_SET.has(audienceGroupRaw) &&
    categoryRaw !== null
  ) {
    const allowed =
      CATEGORIES_BY_GROUP[audienceGroupRaw as JoinableGroup] ?? [];
    if (!(allowed as readonly string[]).includes(categoryRaw)) {
      fields["category"] =
        `category "${categoryRaw}" is not valid for audienceGroup "${audienceGroupRaw}".`;
    }
  }

  // 8. sectorSlugs: optional array, max 3, no duplicates, each must be valid slug
  let sectorSlugs: string[] | null = null;
  if (raw["sectorSlugs"] !== undefined && raw["sectorSlugs"] !== null) {
    if (!Array.isArray(raw["sectorSlugs"])) {
      fields["sectorSlugs"] = "sectorSlugs must be an array.";
    } else {
      const arr = raw["sectorSlugs"] as unknown[];
      // Reject non-string members
      const hasNonString = arr.some((s) => typeof s !== "string");
      if (hasNonString) {
        fields["sectorSlugs"] = "sectorSlugs must contain only strings.";
      } else {
        const slugArr = arr as string[];
        if (slugArr.length > 3) {
          fields["sectorSlugs"] = "sectorSlugs may contain at most 3 items.";
        } else {
          const unique = new Set(slugArr);
          if (unique.size !== slugArr.length) {
            fields["sectorSlugs"] = "sectorSlugs must not contain duplicates.";
          } else {
            const invalid = slugArr.filter((s) => !SECTOR_SLUG_SET.has(s));
            if (invalid.length > 0) {
              fields["sectorSlugs"] =
                `Unknown sector slug(s): ${invalid.join(", ")}.`;
            } else {
              sectorSlugs = slugArr;
            }
          }
        }
      }
    }
  }

  // 9. programSlugs: optional array, no duplicates, each must be valid slug
  let programSlugs: string[] | null = null;
  if (raw["programSlugs"] !== undefined && raw["programSlugs"] !== null) {
    if (!Array.isArray(raw["programSlugs"])) {
      fields["programSlugs"] = "programSlugs must be an array.";
    } else {
      const arr = raw["programSlugs"] as unknown[];
      const hasNonString = arr.some((s) => typeof s !== "string");
      if (hasNonString) {
        fields["programSlugs"] = "programSlugs must contain only strings.";
      } else {
        const slugArr = arr as string[];
        const unique = new Set(slugArr);
        if (unique.size !== slugArr.length) {
          fields["programSlugs"] =
            "programSlugs must not contain duplicates.";
        } else {
          const invalid = slugArr.filter((s) => !PROGRAM_SLUG_SET.has(s));
          if (invalid.length > 0) {
            fields["programSlugs"] =
              `Unknown program slug(s): ${invalid.join(", ")}.`;
          } else {
            programSlugs = slugArr;
          }
        }
      }
    }
  }

  // 10. Organization conditional fields
  let organizationName: string | null = null;
  let contactRole: string | null = null;
  if (joiningAsRaw === "organization") {
    organizationName = requireString(
      "organizationName",
      LIMITS.organizationName,
      raw,
    );
    contactRole = requireString("contactRole", LIMITS.contactRole, raw);
  } else {
    // Still parse them as optional (ignored but stripped)
    organizationName = optionalString(
      "organizationName",
      LIMITS.organizationName,
      raw,
    );
    contactRole = optionalString("contactRole", LIMITS.contactRole, raw);
  }

  // notifyOpportunities: optional boolean, default false
  const notifyOpportunities =
    raw["notifyOpportunities"] === true ? true : false;

  // Collect any remaining field errors
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      fields,
      message: "Validation failed. Please correct the highlighted fields.",
    };
  }

  // All required fields must be non-null at this point
  if (
    fullName === null ||
    emailNormalized === null ||
    country === null ||
    joiningAsRaw === null ||
    audienceGroupRaw === null ||
    categoryRaw === null
  ) {
    return {
      ok: false,
      fields,
      message: "Validation failed. Please correct the highlighted fields.",
    };
  }

  return {
    ok: true,
    data: {
      fullName,
      emailNormalized,
      country,
      city,
      joiningAs: joiningAsRaw,
      audienceGroup: audienceGroupRaw,
      category: categoryRaw,
      organizationName,
      contactRole,
      sectorSlugs,
      programSlugs,
      notifyOpportunities,
      lookingFor,
      consentAccepted: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
router.post(
  "/join-interest",
  limiter,
  async (req: Request, res: Response): Promise<void> => {
    const result = validateJoinInterest(req.body);

    if (!result.ok) {
      sendError(res, 400, "VALIDATION_ERROR", result.message, result.fields);
      return;
    }

    const payload = result.data;

    try {
      const txResult = await db.transaction(async (tx) => {
        // Row-level lock prevents race-condition duplicate inserts
        const existing = await tx
          .select()
          .from(joinInterestsTable)
          .where(
            eq(joinInterestsTable.emailNormalized, payload.emailNormalized),
          )
          .for("update")
          .limit(1);

        if (existing.length === 0) {
          // INSERT — new submission
          const [inserted] = await tx
            .insert(joinInterestsTable)
            .values({
              fullName: payload.fullName,
              emailNormalized: payload.emailNormalized,
              country: payload.country,
              city: payload.city,
              joiningAs: payload.joiningAs,
              audienceGroup: payload.audienceGroup,
              category: payload.category,
              organizationName: payload.organizationName,
              contactRole: payload.contactRole,
              sectorSlugs: payload.sectorSlugs ?? undefined,
              programSlugs: payload.programSlugs ?? undefined,
              notifyOpportunities: payload.notifyOpportunities,
              lookingFor: payload.lookingFor,
              consentAccepted: payload.consentAccepted,
              consentTextVersion: CONSENT_VERSION,
              status: "pending",
            })
            .returning({ id: joinInterestsTable.id });

          return { action: "insert" as const, id: inserted.id };
        }

        const record = existing[0];

        // Converted or archived: return safe deterministic shape, no modification.
        // This does not reveal whether an account exists.
        if (record.status === "converted" || record.status === "archived") {
          return { action: "safe" as const, id: record.id };
        }

        // Pending or reviewed: UPDATE (status unchanged)
        const [updated] = await tx
          .update(joinInterestsTable)
          .set({
            fullName: payload.fullName,
            country: payload.country,
            city: payload.city,
            joiningAs: payload.joiningAs,
            audienceGroup: payload.audienceGroup,
            category: payload.category,
            organizationName: payload.organizationName,
            contactRole: payload.contactRole,
            sectorSlugs: payload.sectorSlugs ?? undefined,
            programSlugs: payload.programSlugs ?? undefined,
            notifyOpportunities: payload.notifyOpportunities,
            lookingFor: payload.lookingFor,
            consentAccepted: payload.consentAccepted,
            consentTextVersion: CONSENT_VERSION,
            updatedAt: new Date(),
          })
          .where(
            eq(joinInterestsTable.emailNormalized, payload.emailNormalized),
          )
          .returning({ id: joinInterestsTable.id });

        return { action: "update" as const, id: updated.id };
      });

      if (txResult.action === "insert") {
        req.log.info(
          { submissionId: txResult.id, status: "received" },
          "join-interest created",
        );
        res.status(201).json({
          success: true,
          submissionId: txResult.id,
          status: "received",
          message: "Your expression of interest has been received.",
        });
      } else {
        // "update" and "safe" both return the identical 200 shape —
        // the safe path intentionally mirrors the update path without
        // disclosing that the record was not modified.
        req.log.info(
          { submissionId: txResult.id, status: "updated" },
          "join-interest updated",
        );
        res.status(200).json({
          success: true,
          submissionId: txResult.id,
          status: "updated",
          message: "Your expression of interest has been updated.",
        });
      }
    } catch (err) {
      req.log.error({ err }, "join-interest server error");
      sendError(res, 500, "SERVER_ERROR", "An unexpected error occurred.");
    }
  },
);

export default router;
