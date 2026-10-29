# 4. Testing every API with Postman

## What is Postman?

Postman is a free app that sends HTTP requests to your API and shows the answers, so you can test a backend without writing a frontend. Download **Postman Desktop** from <https://www.postman.com/downloads/> (the desktop app is needed to reach `localhost`).

## Before you start

- Your server is running (`npm run dev`) and `http://localhost:5000/health` works.
- You ran `npm run create-admin` and know the admin email and password.

## Step 1 - Import the collection

1. Open Postman. Click **Import** (top left).
2. Drag in the file `postman/Akatsukis-Draft.postman_collection.json` from the project folder (or click **files** and choose it).
3. Click **Import**. A collection called **Akatsuki's Draft API** appears in the left sidebar, with folders 0 to 8.

## Step 2 - Set the collection variables

1. Click the collection name > the **Variables** tab.
2. Check these rows (edit the **Current value** column):
   - `baseUrl` = `http://localhost:5000` (later: your Vercel URL, no trailing `/`)
   - `adminEmail` and `adminPassword` = **exactly** the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`
   - The other rows (Alice, Bob, tokens, IDs) can stay as they are. Tokens and IDs fill themselves in.
3. Click **Save** (Ctrl+S). Unsaved variable changes are the #1 cause of "variable is not defined".

## Step 3 - Understand JWT and authorization

- When you **log in**, the API returns a `token` (a long text). That token proves who you are.
- Protected requests must send it in the header `Authorization: Bearer <token>`.
- In Postman this is set in a request's **Authorization** tab: Type **Bearer Token**, Token `{{userToken}}`.
- In this collection it is **already configured** for you. Alice's requests use `{{userToken}}`, Bob's use `{{otherToken}}`, admin requests use `{{adminToken}}`. The login requests save these variables automatically (look at their **Scripts > Post-response** tab to see how).

To do it by hand for any request: open it > **Authorization** tab > Type: **Bearer Token** > paste the token (or `{{userToken}}`).

## Step 4 - Run the requests in order

Click a request, click **Send**, then look at the response and the **Test Results** tab (green = pass).

| Folder | What you test | Expected |
|---|---|---|
| **0. Health check** | `GET /` and `GET /health` | 200, database `connected` |
| **1. Authentication** | Register Alice and Bob, log in as Alice, Bob, Admin, `GET /auth/me` | 201, then 200 with a token. Second run of register gives 409 (fine). |
| **2. Posts (as Alice)** | Create a pending post, a post to reject, a draft; try `status:"approved"` (blocked); public list; my-posts; edit a draft; submit the draft | 201 / 200; the "approved" attempt gives 400; public list and `GET /posts/:id` do **not** show pending posts |
| **3. Admin** | List pending, approve `postId`, reject `rejectId`, approve again | 200, 200, 200, then 400 |
| **4. Public after approval** | The approved post is now visible publicly; the rejected one is not | 200 / 200 / 404 |
| **5. AI improvement** | `POST /ai/improve/:postId`, then confirm a **new** draft exists and the original still has its typos | 201 with a **different** `_id`, `status: "draft"` |
| **6. Update & delete** | Edit and delete the AI draft | 200 |
| **7. Security checks** | No token, bad token, wrong password, `role:"admin"` on register, user calling admin routes, Bob editing/deleting/AI-improving Alice's post, bad ID, missing title | 401 / 403 / 400 as labelled. **They are supposed to be refused.** |
| **8. Cleanup** | Delete the test posts | 200 |

### Run everything at once (optional)

Right-click the collection > **Run collection** > **Run**. Postman runs all requests in order and shows a pass/fail summary. The AI request needs a valid Gemini key; if you have not set it up yet, that one will fail (503) and the rest are unaffected, apart from the three AI follow-up checks.

## Step 5 - The same flow by hand (to understand it)

1. `POST {{baseUrl}}/auth/register`, Body > raw > JSON: `{ "name": "Alice", "email": "alice@example.com", "password": "Password123!" }`
2. `POST {{baseUrl}}/auth/login` with email and password. Copy the `token` from the answer.
3. `POST {{baseUrl}}/posts` with Authorization = Bearer token and body `{ "title": "Hi", "content": "Hello world", "status": "pending" }`. This **submits it for approval**.
4. Log in as admin. `GET {{baseUrl}}/admin/posts/pending` shows the post. `PATCH {{baseUrl}}/admin/posts/approve/<id>` approves it.
5. `GET {{baseUrl}}/posts` (no token) now lists it.

## Testing the live Vercel site

Change `baseUrl` to your Vercel URL (e.g. `https://your-project.vercel.app`), save, and run folders 0 to 8 again. Tokens from local do not work on Vercel if the `JWT_SECRET` differs, so run the login requests again (they do this automatically when you run in order).

## Reading status codes

| Code | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Your input is wrong (missing field, bad ID, forbidden status) |
| 401 | Not logged in, bad/expired token, or wrong password |
| 403 | Logged in but not allowed (not admin, not the owner) |
| 404 | Not found (or not approved, for public routes) |
| 409 | Email already registered |
| 429 / 502 / 503 | AI rate limit / AI failed / server settings missing or database unreachable |
