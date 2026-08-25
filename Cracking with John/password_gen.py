import os, hashlib, random, base64

def hash_password_sha1(password: str) -> str:
    # Generate a 16‑byte random salt
    salt = os.urandom(16)
    # Prepend salt to password
    salted = salt + password.encode("utf-8")
    h = hashlib.sha1(salted).hexdigest()
    # Store salt in hex plus hash in hex: salt_hex$hash_hex
    return salt.hex() + "$" + h


def hash_password_ssha(password: str, salt_len: int = 8) -> str:
    """Generate an LDAP-style SSHA hash for use with John's Salted-SHA1 format.

    Result looks like: {SSHA}Base64(SHA1(password + salt) + salt)
    """
    salt = os.urandom(salt_len)
    digest = hashlib.sha1(password.encode("utf-8") + salt).digest()
    data = digest + salt
    b64 = base64.b64encode(data).decode("ascii")
    return "{SSHA}" + b64

def verify_password_sha1(stored: str, password: str) -> bool:
    salt_hex, stored_hash = stored.split("$", 1)
    salt = bytes.fromhex(salt_hex)
    h = hashlib.sha1(salt + password.encode("utf-8")).hexdigest()
    return h == stored_hash


def generate_random_hashed_passwords(
    source_file: str = "1900-2020.txt",
    output_file: str = "passwords.txt",
    count: int = 300,
) -> None:
    # Read all non-empty passwords from the source wordlist
    with open(source_file, "r", encoding="utf-8", errors="ignore") as f:
        passwords = [line.strip() for line in f if line.strip()]

    if not passwords:
        raise ValueError("No passwords found in source file")

    sample_size = min(count, len(passwords))
    chosen = random.sample(passwords, sample_size)

    # Hash each chosen password and write as username:{SSHA}...
    with open(output_file, "w", encoding="utf-8") as out:
        for idx, pw in enumerate(chosen, start=1):
            username = f"user{idx}"
            stored = hash_password_ssha(pw)
            out.write(f"{username}:{stored}\n")


if __name__ == "__main__":
    generate_random_hashed_passwords()
