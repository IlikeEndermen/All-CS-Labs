import hashlib, itertools, string

prefix = b"trusted_data:"
target = "8c1bc70"  # <-- replace with the 6-hex hash you saw
HASH_LEN = 7
chars = string.ascii_letters + string.digits  # 62 characters

for s in map("".join, itertools.product(chars, repeat=6)):
    data = prefix + s.encode()
    if hashlib.md5(data).hexdigest()[:HASH_LEN] == target:
        print("Found suffix:", s)
        break