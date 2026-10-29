# 3. Run the project on your computer

## Step 0 - Install what you need

1. **Node.js** (LTS version 20 or newer): <https://nodejs.org>. Install it with the default options.
2. **VS Code** (optional but handy): <https://code.visualstudio.com>.
3. **Git**: <https://git-scm.com/downloads>.

Check in a terminal (any folder):

```bash
node -v
npm -v
git --version
```

Each command should print a version number. `node -v` must show `v20` or higher.

## Step 1 - Open the project folder in a terminal

"The project folder" is the folder that directly contains `package.json` (it is called `akatsukis-draft`).

- VS Code: **File > Open Folder...** > choose `akatsukis-draft`, then **Terminal > New Terminal**. The terminal opens in the right place.
- Or in any terminal: `cd path/to/akatsukis-draft`

Check you are in the right place:

```bash
# Mac / Linux            # Windows PowerShell
ls                       dir
```

You must see `package.json`, `src`, `scripts`, `README.md`. If not, you are in the wrong folder and the commands below will fail.

## Step 2 - Install the libraries

Run in the project folder:

```bash
npm install
```

This creates `node_modules/` and `package-lock.json`. It can take a minute. Warnings are normal; red `npm error` lines are not (see troubleshooting).

## Step 3 - Create your `.env` file

Still in the project folder:

```bash
# Mac / Linux
cp .env.example .env
# Windows PowerShell
copy .env.example .env
```

Open `.env` in VS Code and fill in the values:

| Line | What to put |
|---|---|
| `MONGODB_URI` | Your Atlas connection string from [02-mongodb-atlas.md](02-mongodb-atlas.md), with the real username/password and `/akatsukis_draft` before the `?`. |
| `JWT_SECRET` | A long random string. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the output. |
| `GEMINI_API_KEY` | Go to <https://aistudio.google.com/apikey>, sign in with Google, click **Create API key**, copy it. |
| `GEMINI_MODEL` | Leave as is. If AI later says the model is not found, see troubleshooting. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account you want (password at least 8 characters). Remember them: you will log in with them in Postman. |

Rules: no spaces around `=`, no quotes needed, no trailing spaces. Save the file. **Never upload `.env` anywhere.**

## Step 4 - Create the admin account (once)

```bash
npm run create-admin
```

Expected: `Admin created: admin@example.com` (your email). Running it again is safe: it says the user is already an admin.

> Why a script? Anyone can call `/auth/register`, and it always creates a normal `user`. If it could create admins, anyone could take over the site. So admins are created only by someone who controls the server settings.

## Step 5 - Start the server

```bash
npm run dev
```

(`npm start` does the same without auto-restart on file changes.)

Expected output:

```
MongoDB connected
Server running at http://localhost:5000
```

Leave this terminal open: it is your running server. Stop it with **Ctrl + C**.

## Step 6 - Check it works

Open these in your browser:

- <http://localhost:5000/> shows `{"success":true,"message":"Akatsuki's Draft API is running.", ...}`
- <http://localhost:5000/health> shows `"database":"connected"`
- <http://localhost:5000/posts> shows `{"success":true,"count":0,...,"data":[]}` (no approved posts yet)

Now continue with [04-postman-testing.md](04-postman-testing.md).
