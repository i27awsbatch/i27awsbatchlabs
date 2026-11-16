#!/usr/bin/env bash
# Loads backend/.env.local into the environment, then runs Maven with whatever you pass.
#
#   ./mvn-local.sh spring-boot:run     start the backend for development (API only, port 8080)
#   ./mvn-local.sh clean package       build the React UI + backend into one jar (target/i27corehr-backend.jar)
#
# Works the same in Git Bash (Windows), macOS and Linux.
set -euo pipefail

# Always work from the backend folder, wherever the script is called from.
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env.local ]; then
  echo "ERROR: backend/.env.local not found. Copy .env.example to .env.local and fill in your values." >&2
  exit 1
fi

# set -a  = every variable defined from now on is exported to child programs (Maven, Java).
# sed     = strips Windows line endings (\r), in case the file was saved by a Windows editor.
set -a
# shellcheck disable=SC1090
# source <(sed 's/\r$//' .env.local)
eval "$(sed 's/\r$//' .env.local)"
set +a

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "WARNING: DB_PASSWORD is empty in .env.local. The backend will not be able to log in to MySQL." >&2
fi

echo "Loaded .env.local -> DB ${DB_USERNAME:-?}@${DB_HOST:-?}:${DB_PORT:-?}/${DB_NAME:-?}"
exec mvn "$@"
