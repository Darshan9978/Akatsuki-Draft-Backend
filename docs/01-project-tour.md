# 1. Project tour: what every file and folder does

## The big idea (in plain words)

A **backend** is a program that waits for requests from apps (a website, Postman, a phone app) and answers with data.

- **Express** receives the requests and sends back answers.
- **MongoDB Atlas** is the online database that stores users and posts.
- **Mongoose** is the translator between our JavaScript and MongoDB.
- **JWT** (JSON Web Token) is a digital "pass". After you log in you get a token. You show it on every protected request, so the server knows who you are.
- **Gemini** is Google's AI. We send it the post text and it sends back a cleaner version.

A request travels like this:

```
Postman  ->  routes/ (which URL?)  ->  middleware/ (are you logged in? admin?)
         ->  controllers/ (do the work, talk to models/ and MongoDB)  ->  JSON answer
```

## Top-level files

| File | What it is |
|---|---|
| `package.json` | The project's ID card: name, the list of libraries it needs (`dependencies`), and shortcut commands (`scripts`) like `npm run dev`. |
| `package-lock.json` | Created automatically by `npm install`. It pins exact library versions. **Commit it to GitHub.** |
| `.env` | **Your private settings and secrets.** You create it yourself. It is never uploaded to GitHub. |
| `.env.example` | A safe template showing the setting names with fake values. You copy it to `.env`. |
| `.gitignore` | Tells Git which files to never upload (`node_modules/`, `.env`). |
| `README.md` | The project's front page. |
| `node_modules/` | Folder where `npm install` puts the libraries. Huge, auto-generated, never uploaded. |

## `src/` - the application

| File | What it does |
|---|---|
| `src/app.js` | Builds the Express app: CORS, JSON reading, connects to the database, mounts the four route groups, handles errors. **Vercel runs this file.** It does not start a server by itself. |
| `src/start.js` | Used only on your computer. Connects to the database and calls `app.listen(PORT)`. |
| `src/config/db.js` | Connects to MongoDB. It remembers the connection so Vercel does not open a new one for every request. |

### `src/models/` - the shape of the data

| File | What it does |
|---|---|
| `User.js` | Fields: `name`, `email` (unique), `password`, `role` (`admin` or `user`, default `user`). Hashes the password with bcrypt before saving. Hides the password in every response. |
| `Post.js` | Fields: `title`, `description`, `content`, `image`, `category`, `createdBy` (points to a User), `status` (`draft`/`pending`/`approved`/`rejected`), `createdAt`. Mongoose checks lengths and the image URL. |

### `src/routes/` - the URL map

Each file lists "this URL + this method goes to that controller function".

| File | URLs |
|---|---|
| `authRoutes.js` | `/auth/register`, `/auth/login`, `/auth/me` |
| `postRoutes.js` | `/posts`, `/posts/my-posts`, `/posts/:id` |
| `adminRoutes.js` | `/admin/posts/pending`, `/admin/posts/approve/:id`, `/admin/posts/reject/:id` (every route needs login **and** admin role) |
| `aiRoutes.js` | `/ai/improve/:postId` |

Order matters in `postRoutes.js`: `/my-posts` is declared **before** `/:id`, otherwise Express would think "my-posts" is an ID.

### `src/controllers/` - the actual work

| File | What it does |
|---|---|
| `authController.js` | Register (ignores any `role` you send), login (returns the JWT), `me`. |
| `postController.js` | Create, list approved, get one approved, list mine, edit mine, delete mine. Checks ownership and blocks users from setting `approved`/`rejected`. |
| `adminController.js` | List pending posts, approve, reject. Only works on posts that are currently `pending`. |
| `aiController.js` | Loads your post, asks Gemini to improve it, saves the answer as a **new** draft. The original is untouched. |

### `src/middleware/` - checks that run before a controller

| File | What it does |
|---|---|
| `auth.js` | `protect` reads `Authorization: Bearer <token>`, verifies it, loads the user. `adminOnly` returns 403 if the user is not an admin. `signToken` creates tokens. |
| `validateId.js` | Rejects IDs that are not 24 hex characters with a clear 400 message. |
| `errorHandler.js` | Turns any error into a clean `{ success:false, message }` answer, and hides internal details in production. |

### `src/services/` and `src/utils/`

| File | What it does |
|---|---|
| `services/gemini.js` | The only file that talks to Google Gemini. Reads the key from `GEMINI_API_KEY`. Tells the AI to fix grammar/clarity without changing the meaning. |
| `utils/AppError.js` | A small error type carrying an HTTP status code. |
| `utils/asyncHandler.js` | Makes sure errors inside `async` functions reach the error handler. |

## Other folders

| Folder | What it does |
|---|---|
| `scripts/createAdmin.js` | Run with `npm run create-admin`. Creates the first admin using `ADMIN_*` from `.env`. Needed because the public register endpoint can never make an admin. |
| `postman/` | The Postman collection (`Akatsukis-Draft.postman_collection.json`). |
| `docs/` | These guides. |

## Why there is no `vercel.json`

Vercel's Express support finds `src/app.js` on its own (it imports `express` and exports the app). Extra config is only needed in special cases, and the fallback is described in [06-troubleshooting.md](06-troubleshooting.md).

## Post lifecycle

```
draft --(owner sets status: "pending")--> pending --(admin approves)--> approved   (public)
                                              \--(admin rejects)--> rejected
approved --(owner edits content)--> pending   (edits must be re-approved)
AI improve: any of your posts --> NEW post with status "draft"
```
