from flask import Flask, request, render_template, redirect, url_for, make_response, session
import os
import random
import secrets

app = Flask(__name__)
# Use a strong secret from the environment to prevent forged session cookies.
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)


# Flag comes from environment (set by docker-entrypoint.sh) so the
# bash-generated random suffix is what the app displays. For local
# non-Docker runs, fall back to a static default.
_env_flag = os.getenv("FLAG")
if _env_flag:
    FLAG = _env_flag
else:
    FLAG = "FLAG{intercepted_the_sso_code}"


@app.route("/", methods=["GET", "POST"])
def login():
    message = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        sso_code = request.form.get("sso_code", "")

        # Hard-coded admin credentials for the lab
        if username == "admin" and password == "password123":
            stored_code = session.get("sso_code")

            # If the user already has a valid SSO code and submits it correctly, log them in
            if stored_code and sso_code == stored_code:
                session["is_admin"] = True
                return redirect(url_for("admin"))

            # Otherwise, generate/send a new SSO code in the network traffic
            new_code = f"{random.randint(0, 999999):06d}"
            session["sso_code"] = new_code

            # Message that suggests a code was "sent" without revealing it on the page
            message = "SSO code has been sent. Please enter it to continue."

            # Put the SSO code only in an HTTP response header so it is visible in tools
            # like Burp Suite / browser dev tools but not in the page UI.
            resp = make_response(render_template("login.html", message=message))
            resp.headers["X-SSO-CODE"] = new_code
            return resp
        else:
            message = "Invalid username or password."

    return render_template("login.html", message=message)


@app.route("/admin")
def admin():
    if not session.get("is_admin"):
        return redirect(url_for("login"))
    return render_template("admin.html", flag=FLAG)


if __name__ == "__main__":
    # For lab use only; do not expose in production as-is.
    app.run(host="0.0.0.0", port=5000, debug=True)
