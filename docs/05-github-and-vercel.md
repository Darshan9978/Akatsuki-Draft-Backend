# 5. Upload to GitHub, deploy to Vercel, verify the live site

## Part A - Upload to GitHub

### A1. Make sure no secret will be uploaded

Open a terminal in the project folder (the one with `package.json`) and run:

```bash
git init
git add .
git status
```

Read the list under "Changes to be committed":

- It **must** include `.env.example`, `package.json`, `src/...`, `README.md`.
- It **must not** include `.env` or anything inside `node_modules/`.

If you see `.env` or `node_modules` listed, stop and run `git rm -r --cached .env node_modules` and check that `.gitignore` exists.

### A2. Make the first commit

```bash
git commit -m "Initial commit: Akatsuki's Draft backend"
```

If Git says "Please tell me who you are", run these once (use your own name/email), then repeat the commit:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### A3. Create the empty GitHub repository

1. Go to <https://github.com/new>.
2. Repository name: e.g. `akatsukis-draft-backend`.
3. Choose Public or Private. **Do not** tick "Add a README", ".gitignore" or a license (we already have them).
4. Click **Create repository**. GitHub shows the repository URL, like `https://github.com/YOUR-NAME/akatsukis-draft-backend.git`.

### A4. Push

```bash
git branch -M main
git remote add origin https://github.com/YOUR-NAME/akatsukis-draft-backend.git
git push -u origin main
```

A browser window or credential popup may ask you to sign in to GitHub. If it asks for a "password" in the terminal, GitHub no longer accepts account passwords there: use the popup sign-in, or create a **Personal Access Token** (GitHub > Settings > Developer settings > Personal access tokens) and paste it as the password.

### A5. Double-check on GitHub

Refresh the repository page. You should see `src`, `scripts`, `postman`, `docs`, `package.json`, `package-lock.json`, `README.md`, `.env.example`. You must **not** see a file named `.env`. If one ever slips in, treat every secret in it as leaked: rotate the Atlas password, the Gemini key and the JWT secret.

Later changes: `git add .` then `git commit -m "describe change"` then `git push`.

---

## Part B - Deploy to Vercel

### B1. Import the project

1. Sign up / log in at <https://vercel.com> using **Continue with GitHub**.
2. Click **Add New... > Project**.
3. Find your repository and click **Import** (if it is not listed, click "Adjust GitHub App Permissions" and allow that repository).

### B2. Settings on the import screen

- **Framework Preset:** Vercel should detect **Express**. If it says "Other", that is usually still fine.
- **Root Directory:** leave as `./` (the repo root, where `package.json` is).
- **Build / Output settings:** leave default. No build step is needed.

### B3. Add Environment Variables (before clicking Deploy)

Expand **Environment Variables** and add these one by one (Name, then Value):

| Name | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string (with `/akatsukis_draft`) |
| `JWT_SECRET` | A long random string (you may reuse your local one) |
| `JWT_EXPIRES_IN` | `7d` |
| `GEMINI_API_KEY` | Your Gemini key |
| `GEMINI_MODEL` | `gemini-3.6-flash` (or another current model) |
| `CORS_ORIGIN` | `*` |

Do **not** add `ADMIN_*` or `PORT`. Make sure Atlas Network Access allows `0.0.0.0/0` ([02-mongodb-atlas.md](02-mongodb-atlas.md)).

### B4. Deploy

Click **Deploy**. Wait for "Congratulations!". Vercel gives you a URL such as `https://akatsukis-draft-backend.vercel.app`.

> If you change an environment variable later, you must **redeploy** (Deployments > the latest one > **...** > **Redeploy**) for the change to take effect.

---

## Part C - Verify the live deployment (do all of these)

Replace `https://YOUR-APP.vercel.app` with your real URL. In Windows PowerShell write `curl.exe` instead of `curl`. You can also just open the GET URLs in a browser.

1. **Server is up:** `curl https://YOUR-APP.vercel.app/`
   Expect `{"success":true,"message":"Akatsuki's Draft API is running.", ...}`.
2. **Database works:** `curl https://YOUR-APP.vercel.app/health`
   Expect `{"success":true,"status":"ok","database":"connected"}`. A 503 means `MONGODB_URI` or Atlas Network Access is wrong.
3. **Public route:** `curl https://YOUR-APP.vercel.app/posts`
   Expect `{"success":true,...,"data":[]}` (empty until a post is approved).
4. **Protection works:** `curl https://YOUR-APP.vercel.app/auth/me`
   Expect HTTP 401 with "Not logged in".
5. **Full API flow:** in Postman set `baseUrl` to your Vercel URL and run folders 0 to 8 ([04-postman-testing.md](04-postman-testing.md)). You need an admin in the database: the admin you created locally already exists if your local `MONGODB_URI` points to the same Atlas database. Otherwise run `npm run create-admin` locally with that Atlas URI.
6. **AI works live:** folder 5 returns 201 and a new draft appears under `my-posts?status=draft`.
7. **Secrets are safe:** in GitHub, no `.env`; in the browser, no key appears in any API response.
8. **Look at logs if anything fails:** Vercel > your project > **Logs** (runtime logs) shows the real error text.

Only when steps 1 to 6 succeed is the project truly deployed.

### Optional: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

The dashboard flow above is easier for beginners.

Common problems are in [06-troubleshooting.md](06-troubleshooting.md).
