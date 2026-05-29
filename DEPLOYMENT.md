# Deployment Guide: Collaborative Document Editor

This guide details the step-by-step process of deploying the **Collaborative Document Editor** monorepo:
- **Backend (Node.js/Express/Socket.io)** on **Render**
- **Frontend (React/Vite/Tailwind)** on **Vercel**

---

## 1. Prerequisites & Preparation

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and database cluster.
2. Whitelist all IP addresses (`0.0.0.0/0`) in MongoDB Atlas Network Access so Render can connect.
3. Obtain your MongoDB connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/collab_editor?retryWrites=true&w=majority`).
4. Ensure your project is pushed to a remote GitHub repository.

---

## 2. Deploying Backend to Render

Render will host the Node.js API and WebSocket server.

### Step-by-Step Deployment
1. Log in to [Render](https://render.com/).
2. Click **New +** in the top-right and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name:** `collab-doc-editor-backend` (or your choice)
   - **Runtime:** `Node`
   - **Region:** Choose the region closest to your users.
   - **Branch:** `main` (or your deployment branch)
   - **Root Directory:** `backend` ⚠️ *Crucial for monorepo*
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js` (or `npm start`)
   - **Instance Type:** `Free` (or any paid tier)

### Environment Variables
Under the **Environment** tab, click **Add Environment Variable** to add the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations, secure cookies, and SameSite adjustments. |
| `PORT` | `10000` | (Optional) Render automatically assigns a port, but you can explicitly specify it. |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas production connection string. |
| `JWT_SECRET` | `your_long_random_jwt_secret_passkey_here` | A cryptographically secure secret string. |
| `CLIENT_URL` | `https://your-frontend-app.vercel.app` | The production URL of your Vercel frontend. |

5. Click **Create Web Service**. Render will build and deploy your backend.
6. Note down the deployed service URL (e.g., `https://collab-doc-editor-backend.onrender.com`).

---

## 3. Deploying Frontend to Vercel

Vercel will host the compiled static React SPA.

### Step-by-Step Deployment
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Configure the Project settings:
   - **Project Name:** `collab-doc-editor-frontend` (or your choice)
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** Click **Edit** and select `frontend`. ⚠️ *Crucial for monorepo*
   - **Build and Development Settings:** Keep default (Vercel automatically runs `npm run build` and outputs to `dist`).

### Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://collab-doc-editor-backend.onrender.com/api` | The Render backend URL suffixed with `/api`. |
| `VITE_SOCKET_URL` | `https://collab-doc-editor-backend.onrender.com` | The base Render backend URL (no `/api` or trailing slash). |

5. Click **Deploy**. Vercel will build and deploy your React frontend.
6. Once deployed, note your frontend URL (e.g., `https://collab-doc-editor-frontend.vercel.app`).

---

## 4. Post-Deployment Coordination

### Update Backend CORS Settings
Now that your Vercel frontend URL is finalized:
1. Go back to your Render Dashboard for `collab-doc-editor-backend`.
2. Navigate to **Environment**.
3. Update `CLIENT_URL` to match your Vercel deployment URL (e.g., `https://collab-doc-editor-frontend.vercel.app`).
   - *Note:* If you want to support both local development and your deployed frontend, you can separate them with commas:
     `https://collab-doc-editor-frontend.vercel.app,http://localhost:5173`
4. Save changes. Render will automatically trigger a redeployment with the updated CORS origins.

---

## Technical Notes

### Cross-Origin Authentication (HttpOnly Cookies)
Because the frontend and backend are hosted on separate domains, they require cross-origin HttpOnly cookies to maintain session states. The application contains specific setups for this:
- **SameSite=None:** Instructs browsers to send the `token` cookie along with cross-site requests.
- **Secure=True:** Required by all modern browsers when using `SameSite=None` (cookies are only transmitted over HTTPS).
- **Credentials Allowed:** Axios and Socket.IO are configured with `withCredentials: true` to forward cookies.
- **Partitioned=True:** Includes CHIPS support for newer Chrome versions blocking third-party tracking.

### SPA Client-Side Routing
The frontend includes a `vercel.json` file to handle Vite + React Router fallback routing. Vercel automatically routes all client-side page paths (e.g., `/dashboard`, `/document/123`) to `index.html` to avoid `404 Not Found` errors on refresh.
