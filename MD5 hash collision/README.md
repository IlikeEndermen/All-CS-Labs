# CTF Challenge: MD5 Truncated-Hash Collision Service

**Difficulty:** Medium

## Purpose of the Challenge

This challenge demonstrates why:

- Truncating hashes (using only a few leading hex characters), and
- Relying on raw MD5

is insecure for protecting integrity or authorizing actions. The server exposes a “hash verification” service that:

- Uses MD5 on byte strings.
- Only checks the first $HASH\_LEN = 7$ hex characters (28 bits) of the digest.
- Requires that all inputs start with a fixed, known prefix.

Because MD5 is weak and only a truncated digest is used, an attacker can brute‑force a different input with the same *truncated* hash as a protected value and bypass the intended protection.

This is for controlled, educational environments only. Do not attack systems you do not own or have explicit permission to test.

---

## Running the Challenge

From the project directory (with [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile)):

```bash
docker-compose up --build
```

The service listens on port 5000.

To connect locally:

```bash
nc localhost 5000
```

The container entrypoint is [entrypoint.sh](entrypoint.sh), which ensures a `FLAG` is set (either from the environment or a random fallback) before starting [server.py](server.py).

---

## Service Overview

The TCP service is implemented in [server.py](server.py). Key globals:

- [`KNOWN_PREFIX`](server.py):  
  ```py
  KNOWN_PREFIX = b"trusted_data:"
  ```
- [`HASH_LEN`](server.py): number of MD5 hex characters to compare (currently `$7$`).
- [`REFERENCE`](server.py):  
  ```py
  REFERENCE = KNOWN_PREFIX + os.urandom(64)
  ```
  So the reference message is the known prefix plus a random, secret 64‑byte suffix.
- [`REF_HASH_FULL`](server.py) and [`REF_HASH`](server.py):  
  ```py
  REF_HASH_FULL = hashlib.md5(REFERENCE).hexdigest()
  REF_HASH = REF_HASH_FULL[:HASH_LEN]
  ```

### What the server sends

When you connect, [`handle_client`](server.py) will:

1. Print a banner and hash information.
2. Print the exact required prefix `KNOWN_PREFIX`.
3. Print the **reference truncated MD5 hash** `REF_HASH` (first 7 hex characters).
4. Prompt you to submit input.

Your input:

- Must start with `KNOWN_PREFIX`.
- Is hashed with MD5.
- Only the first `HASH_LEN` hex characters of the digest are compared.

Formally, the server checks (using $h(x) = \text{MD5}(x)$, hex‑encoded):

$$
h(\text{data})[:\texttt{HASH\_LEN}] \stackrel{?}{=} h(\texttt{REFERENCE})[:\texttt{HASH\_LEN}]
$$

with the additional requirement that $\text{data}$ starts with `KNOWN_PREFIX`.

### Behavior

From [server.py](server.py):

- If
  - `data.startswith(KNOWN_PREFIX)`, and  
  - $h(\text{data})[:\texttt{HASH\_LEN}] = \texttt{REF\_HASH}$, and  
  - `data != REFERENCE`  

  → **“Collision detected.”** and the real flag is returned from the `FLAG` environment variable.

- If
  - `data == REFERENCE` and  
  - $h(\text{data})[:\texttt{HASH\_LEN}] = \texttt{REF\_HASH}$  

  → You get a **decoy flag** and a troll message:
  `FLAG: CTF{h4sh1ng_1s_s0_much_fun_h4h4h4}`.

- Otherwise → “Invalid input.”

By default, [docker-compose.yml](docker-compose.yml) sets:

```yml
environment:
  - FLAG=CTF{replace_this_with_real_flag}
```

If unset, [entrypoint.sh](entrypoint.sh) generates a random flag of the form:

```sh
CTF{md5_collision_<random_hex>}
```

---

## Goal

You must find some `data` such that:

1. `data` starts with `KNOWN_PREFIX` (the server prints this for you).
2. $h(\text{data})[:\texttt{HASH\_LEN}] = h(\texttt{REFERENCE})[:\texttt{HASH\_LEN}]$  
   i.e., the first 7 hex characters of the MD5 digest match the reference.
3. `data != REFERENCE`.

This is a **truncated hash collision** problem: you never see `REFERENCE`, only its truncated MD5 digest and the required prefix. Your task is to craft a *different* message with the same truncated digest.

---

## Solution Outline

### Step 1: Start the container and connect

1. Run:

   ```bash
   docker-compose up --build
   ```

2. In another terminal, connect:

   ```bash
   nc localhost 5000
   ```

3. Note down:
   - The exact `KNOWN_PREFIX` bytes printed.
   - The reference truncated hash `REF_HASH` (7 hex characters).

Example (you will see different values each run):

```text
== Hash Verification Service ==
Hash algorithm: MD5 (first 7 hex chars)
All inputs must begin with the following prefix:
trusted_data:
Reference hash:
8c1bc70
```

In this example, your target is `"8c1bc70"`.

### Step 2: Understand the brute‑force problem

You must find a suffix `S` such that:

- `data = KNOWN_PREFIX + S`
- $h(\text{data})[:7] = \text{REF\_HASH}$

Because only 28 bits of MD5 are checked, a straightforward offline brute force over reasonable suffixes is feasible.

---

### Step 3: Use `solve.py` to search for a colliding suffix

The helper script [solve.py](solve.py) illustrates a simple brute‑force over fixed‑length alphanumeric suffixes:

```py
import hashlib, itertools, string

prefix = b"trusted_data:"
target = "8c1bc70"  # <-- replace with the 7-hex hash you saw
HASH_LEN = 7
chars = string.ascii_letters + string.digits  # 62 characters

for s in map("".join, itertools.product(chars, repeat=6)):
    data = prefix + s.encode()
    if hashlib.md5(data).hexdigest()[:HASH_LEN] == target:
        print("Found suffix:", s)
        break
```

Usage:

1. Copy the actual `KNOWN_PREFIX` and `REF_HASH` printed by the service.
2. Edit [solve.py](solve.py):
   - Set `prefix` to the exact bytes shown by the server.
   - Set `target` to the 7‑hex `REF_HASH`.
   - Optionally adjust suffix length or character set if desired.
3. Run:

   ```bash
   python solve.py
   ```

When it prints:

```text
Found suffix: XXXXXX
```

construct:

```text
trusted_data:XXXXXX
```

(using your real prefix and discovered suffix).

---

### Step 4: Submit the colliding input

Reconnect with `nc`:

```bash
nc localhost 5000
```

When prompted:

- Paste the exact `KNOWN_PREFIX` plus the discovered suffix.
- Ensure there are **no extra spaces or newlines** beyond what is required (the server uses `.strip()` on the received bytes, but keeping input clean avoids mistakes).

If your input:

- Starts with `KNOWN_PREFIX`,
- Has the same first 7 MD5 hex characters as `REFERENCE`, and
- Is not byte‑for‑byte equal to `REFERENCE`,

the server prints:

```text
Collision detected.
FLAG: CTF{...}
```

The value of the real flag comes from the `FLAG` environment variable ([docker-compose.yml](docker-compose.yml) / [entrypoint.sh](entrypoint.sh)).

---

## Learning Outcomes

- **Truncated hashes reduce security:** Using only the first $n$ bits/hex characters of a hash drastically lowers the collision resistance. For $n = 28$ bits here, random collisions become feasible by brute force.
- **Hash collision vs. preimage resistance:** You never need to recover the secret `REFERENCE`; you only need some other input with the same truncated digest.
- **Why MD5 is unsafe for access control:** Treating a raw (and truncated) MD5 hash as proof of authorization allows brute‑forced or crafted collisions to bypass checks.
- **Protocol design awareness:** Proper integrity and authorization schemes must use modern, collision‑resistant primitives (e.g., HMAC with SHA‑256) and should not rely on truncated, unauthenticated hashes as “signatures.”

## TA Hints for Students

- “A hash is not a signature. What happens if two different messages share the same MD5 digest?”
- “You know the hash of `admin=false`. Do you really need `admin=false` itself, or just something with the same MD5?”
- “Look carefully at the condition that triggers the real flag in server.py. What exactly is it checking?”
