# 6. Troubleshooting

Find your error message, read the cause, apply the fix.

## Installing and starting

| Error | Cause | Fix |
|---|---|---|
| `npm: command not found` / `'npm' is not recognized` | Node.js not installed, or terminal opened before installing | Install Node LTS from nodejs.org, then close and reopen the terminal. |
| `npm error enoent ... package.json` | You are in the wrong folder | `cd` into the folder that contains `package.json`, check with `ls` / `dir`. |
| `Cannot find module 'express'` (or any module) | Libraries not installed | Run `npm install` in the project folder. |
| `Error: Cannot find module '...src/start.js'` | Wrong folder | Same as above. |
| `EADDRINUSE: address already in use :::5000` | Something is already using port 5000 (often a previous server still running) | Stop the other terminal with Ctrl+C, or set `PORT=5001` in `.env`. |
| PowerShell: `running scripts is disabled` | Windows policy | Use Command Prompt or VS Code's terminal, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |

## Database (MongoDB Atlas)

| Error | Cause | Fix |
|---|---|---|
| `MONGODB_URI is not set` | `.env` missing, misspelled, or in the wrong folder | `.env` must be next to `package.json`, named exactly `.env` (not `.env.txt`). Variable names are case-sensitive. |
| `bad auth : authentication failed` | Wrong username or password in the string | Re-check Atlas > Database Access. Make sure no `<` `>` remain. Reset the user's password if unsure. |
| Password has special characters and the string fails | `@ : / ? # %` break the URL | Use a password with only letters and numbers, or URL-encode it (`@` becomes `%40`). |
| `querySrv ENOTFOUND` / `ECONNREFUSED` / "Database connection failed" / 503 | Atlas blocks your IP, or typo in the cluster host | Atlas > Network Access: add your IP (local) or `0.0.0.0/0` (Vercel). Wait until Active. Re-copy the host from Atlas. |
| Connection works on Wi-Fi at home but not at school/work | Network blocks MongoDB's port 27017 | Try a phone hotspot. |
| Data appears in database `test` instead of `akatsukis_draft` | Database name missing in the URI | Make sure it is `...mongodb.net/akatsukis_draft?retryWrites=...`. |

## Login and tokens

| Response | Cause | Fix |
|---|---|---|
| 401 "Invalid email or password" on admin login | Admin was never created, or a different email/password | Run `npm run create-admin`. Make Postman `adminEmail`/`adminPassword` match `.env`. |
| 401 "Not logged in. Send the header..." | No token sent | Authorization tab > Bearer Token > `{{userToken}}`. Run a login request first. |
| 401 "Invalid or expired token" | Token expired, or the server's `JWT_SECRET` changed (different on local vs Vercel) | Log in again to get a fresh token. |
| 403 "Admin access required" | You used a normal user's token on an admin route | Use `{{adminToken}}`. |
| 403 "You can only edit/delete/improve your own posts" | You are not the owner | Use the token of the user who created the post. |
| 409 on register | Email already exists | Expected on a second run; just log in. |
| Postman shows `{{baseUrl}}` literally or "Could not get response" | Variables unsaved, or server not running | Save the Variables tab (Ctrl+S). Start `npm run dev`. Use Postman **Desktop** for localhost. |
| 400 "Invalid JSON in request body" | Body is not valid JSON (trailing comma, single quotes) | Use double quotes, Body > raw > **JSON**. |
| 400 "Invalid id" | `{{postId}}` is empty because creating the post failed earlier | Run the create-post request first and check it returned 201. |

## AI (Gemini)

| Response | Cause | Fix |
|---|---|---|
| 503 "AI service is not configured" | `GEMINI_API_KEY` missing | Add it to `.env` (restart the server) or to Vercel env vars (then redeploy). |
| 502 "The AI service failed" | Bad key, or the model name no longer exists | Check the key at <https://aistudio.google.com/apikey>. Look at the server log line `Gemini error:` for the reason. Pick a current model from <https://ai.google.dev/gemini-api/docs/models> and set `GEMINI_MODEL`. |
| 429 "AI rate limit reached" | Free-tier limit | Wait a minute and retry. |
| 400 "too long" | Content over 20000 characters | Shorten the post. |

## GitHub

| Error | Cause | Fix |
|---|---|---|
| `fatal: not a git repository` | Not in the project folder or `git init` not run | `cd` to the project folder, run `git init`. |
| `remote origin already exists` | You added it twice | `git remote set-url origin <URL>`. |
| `Authentication failed` on push | GitHub rejects account passwords | Sign in through the popup or use a Personal Access Token. |
| `.env` shows up in `git status` | `.gitignore` missing/wrong | Keep `.gitignore` with `.env` in it. If already committed: `git rm --cached .env`, commit, **and rotate all secrets**. |
| `rejected ... fetch first` | You created the repo with a README | `git pull origin main --allow-unrelated-histories` then push. |

## Vercel

| Problem | Cause | Fix |
|---|---|---|
| Page shows `FUNCTION_INVOCATION_FAILED` or 500 | Runtime crash | Vercel > **Logs**. Usually a missing environment variable or a bad `MONGODB_URI`. |
| `/health` returns 503 only on Vercel | Atlas does not allow Vercel | Network Access: add `0.0.0.0/0`. |
| Env var changed but nothing changed | Needs a new deployment | Redeploy from the Deployments tab. |
| 401 HTML page "Authentication Required" | Vercel **Deployment Protection** guards that URL | Use the Production domain (Project > Domains), or Settings > Deployment Protection to adjust. |
| 404 `NOT_FOUND` from Vercel for every route | Vercel did not find the entry file | Confirm `src/app.js` exists in the **repo root** on GitHub (not inside an extra folder) and Root Directory is `./`. If the project sits in a sub-folder of the repo, set that sub-folder as Root Directory. |
| "Cannot find module" in Vercel logs | Dependency missing from `package.json` | Add it with `npm install <name>`, commit `package.json` and `package-lock.json`, push. |
| Deployed but old code | Pushed to a different branch | Vercel deploys the production branch (usually `main`). |

### Fallback if Vercel does not detect the Express app

Only if the steps above fail. Add `api/index.js`:

```js
module.exports = require('../src/app');
```

and `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/api" }] }
```

Commit, push, and redeploy.

## How to ask for help

Copy the exact error text (not a screenshot of part of it), say which file/command/folder you were in, and **remove any secrets** (connection string passwords, API keys) before sharing it.
