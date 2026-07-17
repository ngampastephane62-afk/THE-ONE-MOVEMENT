import type { Response } from "express";

/**
 * Unified error shape for all API error responses.
 *
 * Shape:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "MACHINE_READABLE_CODE",
 *     "message": "Human-readable message",
 *     "fields": { "fieldName": "Field-specific message" }   // omitted when not applicable
 *   }
 * }
 *
 * Codes: VALIDATION_ERROR | RATE_LIMITED | SERVER_ERROR
 */
export function sendError(
  res: Response,
  status: number,
  code: "VALIDATION_ERROR" | "RATE_LIMITED" | "SERVER_ERROR",
  message: string,
  fields?: Record<string, string>,
): void {
  const body: {
    success: false;
    error: { code: string; message: string; fields?: Record<string, string> };
  } = {
    success: false,
    error: { code, message },
  };
  if (fields && Object.keys(fields).length > 0) {
    body.error.fields = fields;
  }
  res.status(status).json(body);
}
