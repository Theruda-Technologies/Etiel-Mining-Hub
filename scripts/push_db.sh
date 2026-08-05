#!/usr/bin/env bash
# Link + push migrations to the Etiel Mining Hub cloud project.
# Prerequisites:
#   1. supabase login   (account that owns project ccompobtyzjanpcfmhxi)
#   2. Database password from Dashboard → Project Settings → Database
#
# Usage:
#   ./scripts/push_db.sh
#   SUPABASE_DB_PASSWORD='...' ./scripts/push_db.sh

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-ccompobtyzjanpcfmhxi}"

echo "Linking project ${PROJECT_REF}..."
if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
  supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
  supabase link --project-ref "$PROJECT_REF"
fi

echo "Pushing migrations..."
supabase db push

echo "Done. Optional: run supabase/smoke_test.sql in the SQL Editor."
