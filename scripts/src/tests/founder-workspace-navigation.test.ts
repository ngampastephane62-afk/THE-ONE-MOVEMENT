import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FOUNDER_SECTIONS, FOUNDER_TOOLS } from "../../../artifacts/web/src/components/founder/founder-workspace-config";
import { ADMIN_TABS } from "../../../artifacts/web/src/lib/admin-navigation";

test("Founder sections link only to defined existing tools", () => {
  const ids = FOUNDER_SECTIONS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const section of FOUNDER_SECTIONS) {
    for (const id of section.toolIds) assert.ok(FOUNDER_TOOLS[id], id);
    if (section.status === "unavailable") {
      assert.ok(section.unavailableNote);
      assert.equal(section.toolIds.length, 0);
    }
  }
});

test("Founder tool destinations use existing routes or allowlisted admin tabs", () => {
  const routes = readFileSync(new URL("../../../artifacts/web/src/pages/member/index.tsx", import.meta.url), "utf8");
  for (const tool of Object.values(FOUNDER_TOOLS)) {
    const target = new URL(tool.href.replace(/^~/, ""), "https://example.invalid");
    if (target.pathname === "/member/admin") {
      assert.ok((ADMIN_TABS as readonly string[]).includes(target.searchParams.get("tab") ?? ""), tool.id);
    } else if (target.pathname.startsWith("/member/")) {
      assert.ok(routes.includes(`path="${target.pathname}"`), tool.id);
    } else {
      assert.equal(target.pathname, "/tropik-magazine/contribute", tool.id);
    }
  }
});

test("Existing member and campaign moderation are discoverable without changing privileges", () => {
  const overview = FOUNDER_SECTIONS.find((s) => s.id === "overview")!;
  assert.ok(overview.toolIds.includes("members"));
  assert.ok(overview.toolIds.includes("gratitude"));
  assert.equal(FOUNDER_TOOLS.members.href, "/member/admin?tab=members");
  assert.equal(FOUNDER_TOOLS.gratitude.href, "/member/admin?tab=gratitude");
  const routes = readFileSync(new URL("../../../artifacts/web/src/pages/member/index.tsx", import.meta.url), "utf8");
  assert.match(routes, /path="\/member\/admin">\{me\.founder \? <Admin/);
});
