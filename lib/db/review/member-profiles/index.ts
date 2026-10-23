// Full current schema, with only the reviewed member-table definition replaced.
// This entry point is for offline SQL generation, not application imports.
export * from "../../src/schema/index";
export { ecosystemMembersTable } from "./ecosystemMembers.proposed";
