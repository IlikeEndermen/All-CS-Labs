#!/bin/sh
set -eu

# Default flag for local testing if none provided
: "${FLAG:=CTF{default_flag_for_testing}}"

# Simple helper to generate a small random integer in [0, max)
rand_index() {
	max="$1"
	# Use /dev/urandom via od; works in busybox/Alpine
	num=$(od -An -N2 -tu2 /dev/urandom 2>/dev/null | tr -d ' ')
	echo $(( num % max ))
}

# Only generate profile values if they were not provided via environment
if [ -z "${PROFILE_NAME:-}" ] || [ -z "${PROFILE_HANDLE:-}" ]; then
	idx=$(rand_index 8)
	case "$idx" in
		0) PROFILE_NAME="Ava Rivers"   ; PROFILE_HANDLE="coffee_coder"    ;;
		1) PROFILE_NAME="Noah Sparks"  ; PROFILE_HANDLE="night_shift_dev" ;;
		2) PROFILE_NAME="Mia Patel"    ; PROFILE_HANDLE="bughunter_mia"   ;;
		3) PROFILE_NAME="Leo Kim"      ; PROFILE_HANDLE="leet_latte"      ;;
		4) PROFILE_NAME="Sofia Cruz"   ; PROFILE_HANDLE="secops_sofia"    ;;
		5) PROFILE_NAME="Eli Stone"    ; PROFILE_HANDLE="stacktrace_eli"  ;;
		6) PROFILE_NAME="Harper Chen"  ; PROFILE_HANDLE="harper_0day"     ;;
		7) PROFILE_NAME="Jordan Blake" ; PROFILE_HANDLE="coffee_overflow" ;;
	esac
fi

if [ -z "${PROFILE_CITY:-}" ]; then
	idx=$(rand_index 6)
	case "$idx" in
		0) PROFILE_CITY="Portland" ;;
		1) PROFILE_CITY="Seattle"  ;;
		2) PROFILE_CITY="Austin"   ;;
		3) PROFILE_CITY="Toronto"  ;;
		4) PROFILE_CITY="Berlin"   ;;
		5) PROFILE_CITY="London"   ;;
	esac
fi

if [ -z "${PROFILE_CAT:-}" ]; then
	idx=$(rand_index 7)
	case "$idx" in
		0) PROFILE_CAT="Mochi"  ;;
		1) PROFILE_CAT="Luna"   ;;
		2) PROFILE_CAT="Pixel"  ;;
		3) PROFILE_CAT="Java"   ;;
		4) PROFILE_CAT="Shadow" ;;
		5) PROFILE_CAT="Nimbus" ;;
		6) PROFILE_CAT="Pip"    ;;
	esac
fi

if [ -z "${PROFILE_GRAD:-}" ]; then
	idx=$(rand_index 7)
	case "$idx" in
		0) PROFILE_GRAD="2010" ;;
		1) PROFILE_GRAD="2011" ;;
		2) PROFILE_GRAD="2012" ;;
		3) PROFILE_GRAD="2013" ;;
		4) PROFILE_GRAD="2014" ;;
		5) PROFILE_GRAD="2015" ;;
		6) PROFILE_GRAD="2016" ;;
	esac
fi

if [ -z "${PROFILE_PUNCT:-}" ]; then
	idx=$(rand_index 5)
	case "$idx" in
		0) PROFILE_PUNCT="!"  ;;
		1) PROFILE_PUNCT="?"  ;;
		2) PROFILE_PUNCT="!!" ;;
		3) PROFILE_PUNCT="!!!";;
		4) PROFILE_PUNCT="?!" ;;
	esac
fi

PROFILE_PASSWORD="${PROFILE_CITY}${PROFILE_CAT}${PROFILE_GRAD}${PROFILE_PUNCT}"

export FLAG PROFILE_NAME PROFILE_HANDLE PROFILE_CITY PROFILE_CAT PROFILE_GRAD PROFILE_PUNCT PROFILE_PASSWORD

# Render login.js from template using the environment variables
envsubst '${FLAG}${PROFILE_HANDLE}${PROFILE_PASSWORD}' < /usr/share/nginx/html/login.js.template > /usr/share/nginx/html/login.js

# Render profile.js from template so profile + login share the same values
if [ -f /usr/share/nginx/html/profile.js.template ]; then
	envsubst '${PROFILE_NAME}${PROFILE_HANDLE}${PROFILE_CITY}${PROFILE_CAT}${PROFILE_GRAD}${PROFILE_PUNCT}' \
		< /usr/share/nginx/html/profile.js.template > /usr/share/nginx/html/profile.js
fi

exec "$@"
