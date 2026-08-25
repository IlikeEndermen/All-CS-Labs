# CTF Challenge: TMI on Social Media

**Difficulty:** Easy

## Purpose of the Challenge

This challenge demonstrates how oversharing on social media enables attackers to guess passwords. The fake profile page reveals personal details that are combined into a predictable password.

## How It Works (Current Implementation)

- Each visitor receives a **unique session** with its own profile and flag.
- Profile details are derived deterministically from the session ID.
- The **password formula** is:  
  `city + cat + graduationYear + punctuation`
- The **username** is the public handle shown on the profile.
- The flag is generated per session as `MaaSec{<16-hex>_flag}` using an MD5 hash.

## How to Run

1. `npm install`
2. `npm start`
3. Visit: http://localhost

## Pages

- `/profile.html` — public profile with clues
- `/index.html` — login page

## API Endpoints

- `GET /api/profile` — returns profile data for the current session
- `GET /api/login-data` — returns handle, password, and flag (intentionally insecure)
- `POST /api/login` — validates credentials for the current session
- `GET /reset` — destroys the session and redirects to `/`

## Solution Outline

1. Open `/profile.html` and read the posts.
2. Extract the password components: city, cat name, grad year, punctuation.
3. Use the profile handle (without `@`) as the username.
4. Log in at `/index.html` with:
   - **Username:** profile handle (e.g., `coffee_coder`)
   - **Password:** `<city><cat><gradYear><punctuation>` (e.g., `PortlandMochi2014!`)
5. The flag is shown after a successful login.

## Flag Location

- The flag is displayed on the login page after successful authentication.
- The flag format is: `MaaSec{[a-f0-9]{16}_flag}`

## Learning Outcomes

- **OSINT and password guessing.** Public information can be combined to guess passwords and security answers.
- **Pattern-based passwords are weak.** Predictable formulas are easily reconstructed from posts.
- **Session-based data.** Each user sees different data and a unique flag.

## TA Hints for Students

"Think like an attacker. What personal details are revealed, and in what order might they be used in a password?"