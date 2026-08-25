#!/bin/sh
set -eu

# Ensure a FLAG exists; generate a random one if not provided
if [ -z "${FLAG:-}" ]; then
    # 16 random bytes from /dev/urandom, hex-encoded
    RAND_HEX=$(od -An -N16 -tx1 /dev/urandom 2>/dev/null | tr -d ' \n')
    FLAG="CTF{md5_collision_${RAND_HEX}}"
fi

export FLAG

# If you later add templates or other setup, do it here
# e.g., envsubst on files before starting the main process

exec "$@"
