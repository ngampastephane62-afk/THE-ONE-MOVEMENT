---
name: Private message preview consistency
description: Avoid trusting a projected inbox preview without comparing it against the conversation's actual latest message.
---

Inbox summaries must be derived from each authorized thread's latest persisted
message, and tested against that thread's history using two signed-in accounts.
A raw, participant-scoped lateral row query was reliable where an ORM-projected
correlated text expression returned an unrelated preview even though the detail
messages and a direct database query were correct.

**Why:** A real two-account development test caught an unrelated message in the
inbox preview after send, reply and reload. Static tests and a correct detail
history did not catch it. The corrected query matched after an authenticated
reload, without changing stored messages.

**How to apply:** When changing message summaries, check the last preview
against the last actual message ID/text through the authenticated API for both
participants. Keep summary queries bounded to authorized thread IDs; do not
read unrelated private chats to debug an inconsistent preview.
