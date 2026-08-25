#!/bin/sh
set -eu

# Default flag for local testing if none provided
: "${FLAG:=MaaSec{default_flag_for_testing}}"
: "${IDENTITY:=test}"

echo "[*] Starting CTF Challenge"
echo "[*] Identity: $IDENTITY"
echo "[*] Flag template: $FLAG"
echo "[*] Dynamic credentials will be generated per session"

# Execute the main command (npm start)
exec "$@"
