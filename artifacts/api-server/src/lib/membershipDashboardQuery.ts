import { GetMembershipDashboardQueryParams } from "@workspace/api-zod";

/** HTTP query values are strings; Orval's numeric enum does not coerce them. */
export function parseMembershipDashboardQuery(query: Record<string, unknown>) {
  const days = query.days;
  const page = query.page;
  return GetMembershipDashboardQueryParams.safeParse({
    ...query,
    ...(typeof days === "string" && /^(7|30|90)$/.test(days) ? { days: Number(days) } : {}),
    ...(typeof page === "string" && /^\d+$/.test(page) ? { page: Number(page) } : {}),
  });
}
