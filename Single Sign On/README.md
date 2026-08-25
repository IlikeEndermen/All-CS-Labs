# CTF Challenge: Single Sign-On Secret Header

**Difficulty:** Medium

## Purpose of the Challenge

The purpose of this challenge is to show how a poorly implemented second factor (SSO/2FA code) can be leaked in HTTP traffic and silently reused by an attacker. In this exercise, students get a simple admin login page that asks for a username, password, and SSO code. When valid credentials are entered, the server “sends” an SSO code — but instead of going to an authenticator app or email, the code is hidden in an HTTP response header. Anyone intercepting the traffic (e.g., with a proxy) can read that header and log in as the admin.

This is for controlled, educational environments only. Do not attack systems you do not own or have explicit permission to test.

## Solution Outline

**Step 1:** Open the main login page at `/` (backed by [`app.login`](app.py)).

**Step 2:** Enter the default admin credentials:
- Username: `admin`
- Password: `password123`
- Leave the SSO code field empty for now.

**Step 3:** Intercept the HTTP response using Burp Suite, a browser proxy, or browser dev tools (Network tab).

**Step 4:** In the response to your login attempt, look for the custom header:

```text
X-SSO-CODE: 123456
```

(The exact 6‑digit number will differ each time.)

**Step 5:** Resend a login request to `/` with:
- `username=admin`
- `password=password123`
- `sso_code=<the value from X-SSO-CODE>`

**Step 6:** On success, you are redirected to `/admin` (handled by [`app.admin`](app.py)), where the flag is displayed.

## Flag Location

- The flag is shown directly on the `/admin` page after a successful SSO login.
- The flag value is taken from the `FLAG` environment variable in [`app.py`](app.py). A default is provided for local runs:
  ```text
  SSO{intercepted_the_sso_code}
  ```

## Learning Outcomes

- **Insecure SSO/2FA design.** Putting one-time codes in easily sniffable places (like HTTP headers) defeats the purpose of “something you have.”
- **Traffic inspection with intercepting proxies.** Students practice capturing and inspecting HTTP requests and responses.
- **Session and header awareness.** Understanding that sensitive data can be stored in sessions and moved around in headers, not just in page content.
- **Threat modeling for web auth flows.** Realizing that every step in an authentication flow must be protected, not only the username/password.

## Intended Solution (Organizer Notes)

1. Students browse to `/` and see the login form rendered by [`templates/login.html`](templates/login.html).
2. They use the default credentials documented above (`admin` / `password123`) but leave the SSO code blank.
3. In [`app.login`](app.py), valid credentials with a missing/incorrect SSO code trigger:
   - Generation of a 6‑digit code via `random.randint`.
   - Storage of the code in `session["sso_code"]`.
   - Re-rendering of the login page with a generic message (“SSO code has been sent…”).
   - Injection of the real SSO code into the `X-SSO-CODE` response header only.
4. With an intercepting proxy or browser dev tools, students read the `X-SSO-CODE` header from the HTTP response.
5. They then resubmit the login form, this time including the captured SSO code in the `sso_code` field.
6. If `sso_code` matches `session["sso_code"]`, [`app.login`](app.py) sets `session["is_admin"] = True` and redirects to `/admin`.
7. [`app.admin`](app.py) checks `session["is_admin"]` and, if set, renders [`templates/admin.html`](templates/admin.html) with the flag visible on the page.

## TA Hints for Students

“Think like an attacker. If the page says an SSO code was sent but you don’t see it in the HTML, where else in the HTTP traffic might that code be hiding?”