# Akatsuki's Draft - AI-Enabled Content Sharing Platform (Backend)

A REST API where users register, write posts (or save drafts), get posts approved by an admin, and improve their writing with Google Gemini. The original post is never overwritten: the AI result is saved as a **new draft**.

**Stack:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, Google Gemini, Postman, GitHub, Vercel.

> New to all this? Read the guides in order:
> 1. [docs/01-project-tour.md](docs/01-project-tour.md) - what every file and folder does
> 2. [docs/02-mongodb-atlas.md](docs/02-mongodb-atlas.md) - create your database
> 3. [docs/03-run-locally.md](docs/03-run-locally.md) - install, configure `.env`, start the server, create the admin
> 4. [docs/04-postman-testing.md](docs/04-postman-testing.md) - test every API
> 5. [docs/05-github-and-vercel.md](docs/05-github-and-vercel.md) - upload to GitHub, deploy, verify the live site
> 6. [docs/06-troubleshooting.md](docs/06-troubleshooting.md) - common errors and fixes

---

## Quick start (about 10 minutes, after MongoDB Atlas is ready)

Open a terminal **inside the project folder** (the folder that contains `package.json`), then:

```bash
npm install
```

Create your private settings file:

```bash
# Mac / Linux
cp .env.example .env
# Windows PowerShell
copy .env.example .env
```

Open `.env` and fill in `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and the three `ADMIN_*` values (details in [docs/03-run-locally.md](docs/03-run-locally.md)). Then:

```bash
npm run create-admin     # creates your first admin account (run once)
npm run dev              # starts the server on http://localhost:5000
```

Open <http://localhost:5000/health>. You should see `{"success":true,"status":"ok","database":"connected"}`.

---

## API reference

Base URL: `http://localhost:5000` locally, or your Vercel URL when live.
Protected routes need the header `Authorization: Bearer <token>` (you get the token from `/auth/login`).

| Method | Path | Who can call it | What it does |
|---|---|---|---|
| POST | `/auth/register` | anyone | Create a normal user (`name`, `email`, `password`). A `role` sent by the client is ignored. |
| POST | `/auth/login` | anyone | Returns a JWT `token`. |
| GET | `/auth/me` | logged in | Your own profile. |
| POST | `/posts` | logged in | Create a post. `status` is `"pending"` (default, sent for approval) or `"draft"`. |
| GET | `/posts` | **public** | Approved posts only. Supports `?page=`, `?limit=` (max 50), `?category=`. |
| GET | `/posts/my-posts` | logged in | All your own posts and drafts. Optional `?status=draft`. |
| GET | `/posts/:id` | **public** | One post, only if it is approved (otherwise 404). |
| PATCH | `/posts/:id` | owner only | Edit your post. Editing an approved post sends it back to `pending`. |
| DELETE | `/posts/:id` | owner only | Delete your post. |
| GET | `/admin/posts/pending` | admin only | Posts waiting for review. |
| PATCH | `/admin/posts/approve/:id` | admin only | Approve a pending post. |
| PATCH | `/admin/posts/reject/:id` | admin only | Reject a pending post. |
| POST | `/ai/improve/:postId` | owner only | Gemini improves grammar/clarity/readability and saves the result as a **new draft**. |
| GET | `/` and `/health` | anyone | Welcome message and database check. |

Request body examples:

```json
// POST /auth/register
{ "name": "Alice", "email": "alice@example.com", "password": "Password123!" }

// POST /posts
{ "title": "My article", "description": "Short summary", "content": "Full text...",
  "image": "https://example.com/cover.jpg", "category": "Technology", "status": "pending" }
```

Errors always look like `{ "success": false, "message": "..." }` with a meaningful status code
(400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 duplicate, 502/503 AI or database problem).

### Security rules built in

- Passwords are hashed with bcrypt and never returned by any endpoint.
- `/auth/register` always creates `role: "user"`. Admins are created only by `npm run create-admin`.
- The user's role is read from the database on every request, never from the token or request body.
- Users can only set `status` to `draft` or `pending`. Only admins can approve or reject.
- Only the owner can edit, delete, or AI-improve a post (403 otherwise).
- Public endpoints return approved posts only.
- All secrets live in environment variables. `.env` is in `.gitignore`.

---

## Environment variables

Copy `.env.example` to `.env` (local) and add the same names in Vercel > Project > Settings > Environment Variables (live).

| Name | Required | Meaning |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB Atlas connection string (with database name `akatsukis_draft`). |
| `JWT_SECRET` | yes | Long random text used to sign tokens. |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d`. |
| `GEMINI_API_KEY` | for AI | Key from <https://aistudio.google.com/apikey>. |
| `GEMINI_MODEL` | no | Gemini model name. Default in code: `gemini-3.6-flash`. |
| `CORS_ORIGIN` | no | `*` (default) or comma-separated allowed websites. |
| `PORT`, `NODE_ENV` | no | Local only. Vercel sets its own. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | local only | Used only by `npm run create-admin`. **Do not add these to Vercel.** |

**Never commit `.env`, and never paste real keys into the README, Postman collection, or GitHub issues.**

---

## Project layout (short version)

```
src/app.js            Express app (also the entry point Vercel uses)
src/start.js          Local server starter (npm start / npm run dev)
src/config/db.js      MongoDB connection (cached for serverless)
src/models/           User and Post schemas
src/controllers/      The logic for each endpoint
src/routes/           Which URL goes to which controller
src/middleware/       Login check, admin check, ID check, error handler
src/services/gemini.js  The Gemini call
scripts/createAdmin.js  Makes the first admin
postman/              Ready-made Postman collection
docs/                 Beginner guides
```

The full explanation of each file is in [docs/01-project-tour.md](docs/01-project-tour.md).

---

## Deployment summary

1. Push to GitHub (never include `.env`).
2. On vercel.com choose **Add New > Project**, import the repo, add the environment variables, click **Deploy**.
3. No `vercel.json` is needed: Vercel's Express support auto-detects `src/app.js`, which exports the app.
4. Verify the live URL using the checklist in [docs/05-github-and-vercel.md](docs/05-github-and-vercel.md).

## Optional extension (not implemented)

The assignment PDF links Gemini's document-processing docs ("upload files"). This project improves text that is already in a post. Uploading a PDF/document to Gemini and turning it into a post is a possible extension.
