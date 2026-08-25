import re

rows = []
with open("passwords.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        m = re.fullmatch(r"(user(\d+)):\{SSHA\}(.+)", line)
        if not m:
            raise SystemExit(f"Bad line: {line}")
        username = m.group(1)
        user_id = int(m.group(2))
        pw = "{SSHA}" + m.group(3)
        email = f"{username}@example.com"
        role = "user"
        # Escape single quotes just in case (SSHA base64 usually doesn't have them)
        esc = lambda s: s.replace("'", "''")
        rows.append(f"({user_id},'{esc(username)}','{esc(email)}','{esc(pw)}','{role}')")

sql = "INSERT INTO `users` (`id`,`username`,`email`,`password`,`role`) VALUES\n" + ",\n".join(rows) + ";\n"

with open("sql_commands.txt", "w", encoding="utf-8") as out:
    out.write(sql)
