# All-CS-Labs

A collection of intentionally vulnerable web application challenges, built
for the tutorial session at Maastricht University's Computer Security course for students to explore common web security vulnerabilities hands-on.

> ⚠️ **These applications are deliberately insecure.** They exist to
> demonstrate and practice exploiting specific vulnerability classes. None of
> the code here — weak session handling, default credentials, verbose debug
> output, etc. — reflects how I'd build a production application. Do not
> deploy any of this outside an isolated lab environment.

## Structure

Each challenge lives in its own directory with its own Dockerfile and
environment-based configuration, so it can be built and run in isolation:

```
<challenge-name>/
├── Dockerfile
├── .env.example
├── README.md          # what the challenge covers, how to run it, the goal
└── src/
```

Challenges are split across two stacks:

- **Node/Express challenges** — session-handling vulnerabilities
  (e.g. [weak session secrets / session fixation — name the actual issues])
- **Flask challenges** — session-handling and access-control issues on the
  Python side

## Running a challenge

```bash
cd <challenge-name>
cp .env.example .env
docker build -t <challenge-name> .
docker run -p <port>:<port> --env-file .env <challenge-name>
```

Each challenge's own README has the specific goal and any hints.

## Origin

These challenges were inspired by personal experience in solving these kinds of challenges. These were used for actual tutorials for the Computer Security course at Maastricht University, and were specifically curated to be able to be solved by everyone with enough determination and research. They were used for grading as well for the courses.

## Setup notes

- Requires Docker.
- Do not commit `.env` files with real secrets — only `.env.example`.
- `venv/` and `node_modules/` are gitignored; run each stack's install step
  locally (`pip install -r requirements.txt` / `npm install`) before running
  outside Docker.
