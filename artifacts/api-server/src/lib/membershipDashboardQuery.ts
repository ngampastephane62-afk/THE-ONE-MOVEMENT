import { GetMembershipDashboardQueryParams } from "@workspace/api-zod";

/** HTTP query values are strings; Orval's numeric enum does not coerce them. */
export function parseMembershipDashboardQuery(query: Record<string, unknown>) {
  const days = query.days;
  return GetMembershipDashboardQueryParams.safeParse({
    ...query,
    ...(typeof days === "string" && /^(7|30|90)$/.test(days) ? { days: Number(days) } : {}),
  });
}
