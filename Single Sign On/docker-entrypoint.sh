#!/bin/sh
set -eu

# Default flag for local testing if none provided explicitly.
: "${FLAG:=FLAG{intercepted_the_sso_code}}"

# Simple helper to generate a small random integer in [0, max)
rand_index() {
	max="$1"
	# Use /dev/urandom via od; works in busybox/Alpine and Debian-based images
	num=$(od -An -N2 -tu2 /dev/urandom 2>/dev/null | tr -d ' ')
	echo $(( num % max ))
}

# If FLAG was left at the default value, randomize it per-container
if [ "${FLAG}" = "FLAG{intercepted_the_sso_code}" ]; then
	# Generate a 16-hex-character suffix using /dev/urandom + od
	suffix=$(od -An -N8 -tx1 /dev/urandom 2>/dev/null | tr -d ' \n')
	FLAG="FLAG{intercepted_the_sso_code_${suffix}}"
fi

export FLAG

# Ensure a strong Flask secret key is set for signing session cookies.
: "${FLASK_SECRET_KEY:=$(od -An -N32 -tx1 /dev/urandom 2>/dev/null | tr -d ' \n')}"
export FLASK_SECRET_KEY

# Start the Flask app with Gunicorn
exec gunicorn --bind 0.0.0.0:5000 app:app