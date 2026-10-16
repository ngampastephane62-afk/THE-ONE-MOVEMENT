---
name: Paid publication file boundaries
description: Protect paid originals in development as well as in the deployed application.
---

Keep the complete paid publication in private App Storage, with only a separately rendered cover public. Paid download access must follow a verified real payment owned by the signed-in reader; test sessions, print purchases and return-URL parameters do not grant the digital file.

**Why:** The magazine is sold independently of free humanitarian films. A successful browser redirect is not proof of payment, and the connected payment account was in test mode during development.

**How to apply:** Preserve server-owned prices, exact-total confirmation, idempotent order creation, owner-scoped access and refund/dispute revocation. Never make a test checkout a free path to the paid PDF.

Also block raw paid originals from the development server's direct filesystem routes, not only from application endpoints and deployment files.

**Why:** Vite's allowed workspace root can include uploaded assets. Ignoring an original in Git and deployment does not itself stop a development filesystem URL from exposing it.

**How to apply:** When another paid issue is uploaded, review the development file-serving deny rules as well as private storage, route authorization and deployment exclusions. Do not remove the original from the user's workspace just to protect it.
