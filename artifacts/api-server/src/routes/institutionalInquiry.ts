/**
 * POST /api/institutional-inquiry
 *
 * Public endpoint for institutional parties (embassies, governments, NGOs,
 * sponsors, etc.) to submit an inquiry.
 *
 * Duplicates: repeated inquiries from the same email are ALLOWED.
 * Anti-abuse: same normalized email is capped at 3 ACCEPTED inquiries per
 * CALENDAR UTC day (counted by created_at within current UTC date).
 *   - Cap model: SELECT COUNT(*) WHERE email_normalized = ? AND created_at >= today_utc_start
 *   - Count >= 3 → 429 RATE_LIMITED, generic message, never disclosing prior count
 *
 * Success: HTTP 201 { success: true, submissionId, status: "received", message }
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { eq, gte, and, sql, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { institutionalInquiriesTable } from "@workspace/db/schema";
import {
  ORGANIZATION_TYPE_SET,
  CONSENT_VERSION,
} from "@workspace/shared";
import { sendError } from "../lib/errorResponse";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";

const router: IRouter = Router();
const limiter = createRateLimiter(); // separate bucket instance from joinInterest

// ---------------------------------------------------------------------------
// Field length limits (published in the endpoint contract)
// ---------------------------------------------------------------------------
const LIMITS = {
  organizationName: 160,
  organizationType: 60,
  country: 90,
  city: 90,
  website: 200,
  contactName: 120,
  contactRole: 120,
  email: 254,
  message: 1000,
};

// Daily cap per normalized email
const DAILY_CAP = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates that a website URL is a safe http(s) URL.
 * Rejects: javascript: URLs, data: URLs, malformed URLs.
 */
function isValidWebsiteUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// ---------------------------------------------------------------------------
// Plain typed validator
// ---------------------------------------------------------------------------
type ValidationResult =
  | { ok: true; data: ValidatedPayload }
  | { ok: false; fields: Record<string, string>; message: string };

interface ValidatedPayload {
  organizationName: string;
  organizationType: string;
  country: string;
  city: string | null;
  website: string | null;
  contactName: string;
  contactRole: string;
  emailNormalized: string;
  message: string;
  consentAccepted: boolean;
}

function validateInstitutionalInquiry(body: unknown): ValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, fields: {}, message: "Malformed payload." };
  }

  const raw = body as Record<string, unknown>;
  const fields: Record<string, string> = {};

  function requireString(
    key: string,
    maxLen: number,
  ): string | null {
    const val = raw[key];
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

  function optionalString(
    key: string,
    maxLen: number,
  ): string | null {
    const val = raw[key];
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

  const organizationName = requireString("organizationName", LIMITS.organizationName);
  const organizationTypeRaw = requireString("organizationType", LIMITS.organizationType);
  const country = requireString("country", LIMITS.country);
  const city = optionalString("city", LIMITS.city);
  const websiteRaw = optionalString("website", LIMITS.website);
  const contactName = requireString("contactName", LIMITS.contactName);
  const contactRole = requireString("contactRole", LIMITS.contactRole);
  const emailRaw = requireString("email", LIMITS.email);
  const message = requireString("message", LIMITS.message);

  // Normalize email
  const emailNormalized = emailRaw ? emailRaw.toLowerCase() : null;

  // Email format
  if (emailNormalized !== null && !isValidEmail(emailNormalized)) {
    fields["email"] = "A valid email address is required.";
  }

  // consentAccepted must be exactly boolean true
  if (raw["consentAccepted"] !== true) {
    fields["consentAccepted"] = "Consent must be accepted.";
  }

  // organizationType enum
  if (
    organizationTypeRaw !== null &&
    !ORGANIZATION_TYPE_SET.has(organizationTypeRaw)
  ) {
    fields["organizationType"] =
      "organizationType must be one of: embassy, government, international-organization, university, ngo, sponsor, partner, media-organization.";
  }

  // website: must be safe http(s) URL if provided
  let website: string | null = null;
  if (websiteRaw !== null) {
    if (!isValidWebsiteUrl(websiteRaw)) {
      fields["website"] =
        "website must be a valid http or https URL.";
    } else {
      website = websiteRaw;
    }
  }

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      fields,
      message: "Validation failed. Please correct the highlighted fields.",
    };
  }

  if (
    organizationName === null ||
    organizationTypeRaw === null ||
    country === null ||
    contactName === null ||
    contactRole === null ||
    emailNormalized === null ||
    message === null
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
      organizationName,
      organizationType: organizationTypeRaw,
      country,
      city,
      website,
      contactName,
      contactRole,
      emailNormalized,
      message,
      consentAccepted: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
router.post(
  "/institutional-inquiry",
  limiter,
  async (req: Request, res: Response): Promise<void> => {
    const result = validateInstitutionalInquiry(req.body);

    if (!result.ok) {
      sendError(res, 400, "VALIDATION_ERROR", result.message, result.fields);
      return;
    }

    const payload = result.data;

    try {
      // Daily cap: count accepted inquiries from this email within the current UTC day
      const todayUtcStart = new Date();
      todayUtcStart.setUTCHours(0, 0, 0, 0);

      const [{ total }] = await db
        .select({ total: count() })
        .from(institutionalInquiriesTable)
        .where(
          and(
            eq(
              institutionalInquiriesTable.emailNormalized,
              payload.emailNormalized,
            ),
            gte(institutionalInquiriesTable.createdAt, todayUtcStart),
          ),
        );

      if (Number(total) >= DAILY_CAP) {
        sendError(
          res,
          429,
          "RATE_LIMITED",
          "Too many requests. Please try again later.",
        );
        return;
      }

      const [inserted] = await db
        .insert(institutionalInquiriesTable)
        .values({
          organizationName: payload.organizationName,
          organizationType: payload.organizationType,
          country: payload.country,
          city: payload.city,
          website: payload.website,
          contactName: payload.contactName,
          contactRole: payload.contactRole,
          emailNormalized: payload.emailNormalized,
          message: payload.message,
          consentAccepted: payload.consentAccepted,
          consentTextVersion: CONSENT_VERSION,
          status: "new",
        })
        .returning({ id: institutionalInquiriesTable.id });

      req.log.info(
        { submissionId: inserted.id, status: "received" },
        "institutional-inquiry created",
      );

      res.status(201).json({
        success: true,
        submissionId: inserted.id,
        status: "received",
        message: "Your inquiry has been received.",
      });
    } catch (err) {
      req.log.error({ err }, "institutional-inquiry server error");
      sendError(res, 500, "SERVER_ERROR", "An unexpected error occurred.");
    }
  },
);

export default router;
