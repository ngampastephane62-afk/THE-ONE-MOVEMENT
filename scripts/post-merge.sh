#!/bin/bash
set -euo pipefail
# File merges never authorize database schema changes, seeds or provider setup.
pnpm install --frozen-lockfile
echo "Dependencies installed. No database migrations or external integrations were run."
