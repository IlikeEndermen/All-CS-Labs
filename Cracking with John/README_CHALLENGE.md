# CTF Challenge: Cracking with John – Web + SQL + Hashes

**Difficulty:** Hard

## Purpose of the Challenge

This challenge demonstrates how weak password‑storage practices and leaked hashes from a database can be abused to compromise a web application.

Students receive or have access to:

- A running PHP web application (see [`web/index.php`](web/index.php) and [`web/dashboard.php`](web/dashboard.php)) deployed via the Docker stack in [`docker-compose.yml`](docker-compose.yml).
- Network access and credentials to the backing MySQL database (`john_challenge.users`), which the site uses for authentication (see [`web/config.php`](web/config.php)).
- A date‑style password wordlist [`1900-2020.txt`](1900-2020.txt), which was used to generate all user passwords.
- Optionally, reference seed files such as [`db_dump.sql`](db_dump.sql), [`testing_dump.sql`](testing_dump.sql), or [`website_users.sql`](website_users.sql) if you want to show them how the data was created.

Passwords in the `users` table are stored as LDAP‑style salted SHA‑1 (SSHA) hashes in the `password_hash` column, in the form:

- `$\,\texttt{\{SSHA\}Base64(SHA1(password + salt) + salt)}$`

The goal is to:

1. Discover which users are admins in the database.
2. Dump the `users` table locally and recognize the SSHA hash format.
3. Use John the Ripper with the provided [`1900-2020.txt`](1900-2020.txt) wordlist to crack at least one admin password offline.
4. Log in to the site as that admin and retrieve the flag from [`web/dashboard.php`](web/dashboard.php).

> **Important:** This is for an isolated lab environment only. Do **not** use these techniques against systems you do not own or explicitly control.

## Solution Outline

**Step 1:** Connect to the MySQL instance backing the challenge using the provided credentials (for example, something like  
`mysql -h <ip> -u john_user -p john_challenge`) and enumerate the `users` table:

- `SELECT id, username, role FROM users;`
- `SELECT id, username, password_hash, role FROM users WHERE role = 'admin';`

Identify which rows correspond to admin users.

**Step 2:** Dump the `users` table (or full `john_challenge` database) to your local machine, for example using `mysqldump`, and inspect the `password_hash` column. You will see values like:

- `user42:{SSHA}Base64(...)` in seed files such as [`passwords.txt`](passwords.txt) or  
- `{SSHA}Base64(...)` values directly in the `password_hash` column of `users`.

From the `{SSHA}` prefix and base64 payload, infer that the hashes are LDAP‑style salted SHA‑1 (SSHA), consistent with the generation logic in [`password_gen.py`](password_gen.py) and the verification code in [`web/index.php`](web/index.php).

**Step 3:** Extract the SSHA hashes into a format John the Ripper accepts (for example, a file containing one `{SSHA}...` hash per line, or `username:{SSHA}...` pairs as in [`passwords.txt`](passwords.txt)).

Run John the Ripper in SSHA mode in your lab environment, using the provided date‑style wordlist [`1900-2020.txt`](1900-2020.txt):

- `john --format=ssha --wordlist=1900-2020.txt hashes.txt`x

Wait for John to crack passwords and record any recovered `username → password` pairs, focusing on users with `role = 'admin'`.

**Step 4:** With at least one cracked admin credential, browse to the running site’s login page at [`web/index.php`](web/index.php) (exposed via Docker, e.g. `http://<ip>:8080/`).

Log in using:

- **Username:** an admin username from the `users` table.
- **Password:** the cracked plaintext for that user.

On successful admin login, you are redirected to [`web/dashboard.php`](web/dashboard.php), which confirms success and reveals the flag.

## Flag Location

- The flag is displayed on the admin dashboard after a successful admin login.
- The flag is:

```text
FLAG{john_the_ripper_challenge_solved}
```

## Learning Outcomes

- **Hash identification and analysis.** Recognize LDAP‑style SSHA from the `{SSHA}` prefix and base64 format, and understand why salted hashes are stronger than unsalted MD5 but still vulnerable to offline attacks with weak passwords and good wordlists.
- **Linking data sources.** Correlate the `users` table in the database (see [`testing_dump.sql`](testing_dump.sql) / [`website_users.sql`](website_users.sql)) with cracked credentials, focusing on which rows are admins.
- **Offline password cracking.** Safely use tools like John the Ripper in a controlled lab to recover weak passwords from SSHA hashes using a targeted list such as [`1900-2020.txt`](1900-2020.txt).
- **Privilege escalation via credentials.** See how cracking one admin password is enough to gain elevated access in the application and retrieve the flag.
- **Defense perspective.** Appreciate the need for strong, adaptive password hashing (e.g., bcrypt, scrypt, Argon2) and good password hygiene to resist offline cracking.

## Intended Solution (Organizer Notes)

1. **Environment and database setup**

   1. Start the lab stack using Docker (see [`docker-compose.yml`](docker-compose.yml)):
      - `docker-compose up -d`
   2. The `db` service initializes the `john_challenge` database from [`db_dump.sql`](db_dump.sql) or a similar seed (e.g. [`testing_dump.sql`](testing_dump.sql)), creating a `users` table with columns:
      - `id`, `username`, `email`, `password_hash`, `role`.
   3. Optionally use scripts such as [`password_gen.py`](password_gen.py) and [`insert.py`](insert.py) to regenerate SSHA hashes from [`1900-2020.txt`](1900-2020.txt) and rebuild the insert statements stored in [`sql_commands.txt`](sql_commands.txt).

2. **Student database enumeration**

   1. Provide students with MySQL credentials (for example, `john_user` / `change_me` as used in [`docker-compose.yml`](docker-compose.yml)).
   2. Students connect using:
      - `mysql -h <challenge_ip> -u <user> -p john_challenge`
   3. They enumerate admin accounts:
      - `SELECT id, username, role FROM users;`
      - `SELECT id, username, password_hash FROM users WHERE role = 'admin';`

3. **Hash inspection and type inference**

   1. Students dump the `users` table or whole database to a local file (e.g. `mysqldump -h <ip> -u <user> -p john_challenge users > users.sql`).
   2. They inspect the `password_hash` column (or a derived file like [`passwords.txt`](passwords.txt)) and observe that:
      - Each hash begins with `{SSHA}`.
      - The remainder is base64‑encoded.
   3. From this, they infer salted SHA‑1 in LDAP‑style SSHA format, matching both the generation function in [`password_gen.py`](password_gen.py) and the verification logic in [`web/index.php`](web/index.php) (`verify_ssha`).

4. **Offline cracking with John the Ripper**

   1. Students convert the hashes into a John‑friendly file (for example, one `{SSHA}...` per line or `username:{SSHA}...` pairs).
   2. They run John the Ripper in SSHA mode with the provided date‑based wordlist:
      - `john --format=ssha --wordlist=1900-2020.txt hashes.txt`
   3. They wait until at least one admin account’s password has been cracked and note the recovered `username` and plaintext password.

5. **Web login and flag retrieval**

   1. The `web` service in [`docker-compose.yml`](docker-compose.yml) exposes the app on port 8080 by default:
      - `http://<challenge_ip>:8080/`
   2. Students browse to [`web/index.php`](web/index.php) and log in using the cracked admin credentials.
   3. The login code uses `verify_ssha` against the `password_hash` column in the `users` table. On success, it stores `id`, `username`, and `role` in the session and redirects to [`web/dashboard.php`](web/dashboard.php).
   4. If `role = 'admin'`, [`web/dashboard.php`](web/dashboard.php) displays a success message and the flag:
      - `FLAG{john_the_ripper_challenge_solved}`

6. **Optional extensions**

   - Adjust usernames, hash strength, and the flag text by modifying the database seed file (e.g. [`db_dump.sql`](db_dump.sql) or [`testing_dump.sql`](testing_dump.sql)), regenerating hashes with [`password_gen.py`](password_gen.py), and updating the flag string in [`web/dashboard.php`](web/dashboard.php).
   - Provide an explicit “leaked hashes” file to students (e.g. exporting `username:{SSHA}...` lines into [`passwords.txt`](passwords.txt)) instead of having them dump MySQL themselves, for an easier variant.

## TA Hints for Students

- “How many users in the `users` table are admins? Which columns tell you that?”
- “Look closely at the `password_hash` values. What does the `{SSHA}` prefix and base64 string suggest about the hash type?”
- “Which John the Ripper `--format` option matches LDAP‑style salted SHA‑1 (SSHA)?”
- “Where did the passwords come from, and which wordlist might be especially effective here?” (hint: [`1900-2020.txt`](1900-2020.txt))
- “Once you’ve cracked an admin password, where do you use it in the web app?”
