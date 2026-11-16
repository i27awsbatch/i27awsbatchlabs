#!/usr/bin/env bash
# Runs the already-built jar with backend/.env.local loaded.
# The jar serves both the UI and the API on one port: http://localhost:8080
#
#   ./mvn-local.sh clean package     build first (once, or after every code change)
#   ./run-local.sh                   then run
#
# Works the same in Git Bash (Windows), macOS and Linux.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

JAR=target/i27corehr-backend.jar

if [ ! -f "$JAR" ]; then
  echo "ERROR: $JAR not found. Build it first with: ./mvn-local.sh clean package" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "ERROR: backend/.env.local not found. Copy .env.example to .env.local and fill in your values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
# source <(sed 's/\r$//' .env.local)
eval "$(sed 's/\r$//' .env.local)"
set +a

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "WARNING: DB_PASSWORD is empty in .env.local. The backend will not be able to log in to MySQL." >&2
fi

echo "Loaded .env.local -> DB ${DB_USERNAME:-?}@${DB_HOST:-?}:${DB_PORT:-?}/${DB_NAME:-?}"
exec java -jar "$JAR"
