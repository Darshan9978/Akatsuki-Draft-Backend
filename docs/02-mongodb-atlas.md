# 2. MongoDB Atlas setup (free)

You do this once. Atlas's screens change a little over time, so if a button has a slightly different name, look for the closest one.

## Step 1 - Create an account and a cluster

1. Go to <https://www.mongodb.com/cloud/atlas/register> and sign up (Google sign-in is fine).
2. Create an **Organization** and a **Project** if asked (any names, e.g. `akatsukis-draft`).
3. Click **Create** (or **Build a Database**) and choose the **Free (M0)** tier.
4. Pick any cloud provider and the region closest to you. Name the cluster e.g. `Cluster0`. Click **Create**.

## Step 2 - Create a database user

This is the username/password **the app** uses (it is not your Atlas login).

1. Left menu: **Security > Database Access** > **Add New Database User**.
2. Authentication method: **Password**.
3. Username: e.g. `akatsukiUser`. Click **Autogenerate Secure Password** (or type your own) and **copy the password now**.
4. Tip: avoid special characters such as `@ : / ? # %` in the password. If you must use them, they must be URL-encoded in the connection string (see troubleshooting).
5. Privileges: **Read and write to any database**. Click **Add User**.

## Step 3 - Allow network access

1. Left menu: **Security > Network Access** > **Add IP Address**.
2. For local testing you can click **Add Current IP Address**.
3. **For Vercel you must allow all addresses:** enter `0.0.0.0/0` and confirm. (Vercel does not have one fixed IP, so a single IP will not work.) This is safe enough for learning because the database still needs your username and password.
4. Wait until the status shows **Active**.

## Step 4 - Get the connection string

1. **Database** (or **Clusters**) > click **Connect** on your cluster.
2. Choose **Drivers** > Driver **Node.js**.
3. Copy the string. It looks like this (fake example):

```
mongodb+srv://<db_username>:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## Step 5 - Put it in your `.env`

You will create `.env` in [03-run-locally.md](03-run-locally.md). The value must:

1. Replace `<db_username>` and `<db_password>` with your real database user (no `<` `>` characters left!).
2. Contain the database name `akatsukis_draft` between the `/` and the `?`.

```
MONGODB_URI=mongodb+srv://akatsukiUser:YourPassword@cluster0.abcde.mongodb.net/akatsukis_draft?retryWrites=true&w=majority
```

MongoDB creates the database and its collections automatically the first time the app saves data. You do not create tables by hand.

## Step 6 - Verify the connection

After `npm run dev` (see next guide) you should see:

```
MongoDB connected
Server running at http://localhost:5000
```

Then open <http://localhost:5000/health>: it must show `"database":"connected"`.

To see your data: Atlas > **Database** > **Browse Collections**. After registering a user you will see the `akatsukis_draft` database with a `users` collection (and `posts` later). In the `users` collection, the password must look like `$2a$10$...` (hashed), never plain text. On the **Indexes** tab of `users` you should see a unique `email_1` index.

## Keep secrets safe

- The password and connection string are secrets. Never paste them into GitHub, screenshots, chats, or the README.
- If you leak one by mistake: Atlas > Database Access > **Edit** the user > set a new password, then update `.env` and Vercel.
