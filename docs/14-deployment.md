# Part 14: Production Deployment

In this guide, you will move your application from your local machine to the cloud. You will set up a MongoDB Atlas database, deploy your backend to Render, deploy your frontend to Vercel, and configure cross-origin cookies so authentication works across separate domains.

---

## 1. Hosting Database on MongoDB Atlas

Your cloud backend needs a cloud database to store documents and user data:

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (Free tier).
3. **Database Access**: Create a database user with read/write permissions.
4. **Network Access**: Add `0.0.0.0/0` (Allow from Anywhere) so Render can connect.
5. Click **Connect** -> **Drivers** -> Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/collab_editor?retryWrites=true&w=majority
   ```

---

## 2. Deploying Backend on Render

Render hosts your Node.js API and WebSocket server.

1. Push your code to a GitHub repository.
2. Log into [Render](https://render.com) and click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   * **Runtime**: `Node`
   * **Root Directory**: `backend` *(important for monorepo)*
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Add these Environment Variables:
   * `NODE_ENV`: `production`
   * `MONGO_URI`: your MongoDB Atlas connection string
   * `JWT_SECRET`: a long random secret string
   * `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Click **Deploy**. Note the live URL (e.g., `https://your-backend.onrender.com`).

> [!IMPORTANT]
> The `CLIENT_URL` value must match your Vercel frontend URL exactly. If you need to support multiple origins (e.g., production + local dev), separate them with commas:
> `https://your-frontend.vercel.app,http://localhost:5173`

---

## 3. Deploying Frontend on Vercel

Vercel hosts the compiled React app as static files.

### SPA Routing Fix (`frontend/vercel.json`)
React uses client-side routing. Without a rewrite rule, refreshing a page like `/document/123` would return a 404. The `vercel.json` file handles this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploying
1. Log into [Vercel](https://vercel.com) and import your GitHub repository.
2. Configure the project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend` *(important for monorepo)*
3. Add Environment Variables:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api`
   * `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
4. Click **Deploy**.

---

## 4. Cross-Origin Cookie Configuration

Since Vercel and Render use different domains, the browser treats API calls as cross-site requests. For HttpOnly cookies (auth tokens) to work, the backend uses these settings in production:

- `sameSite: 'none'` — tells the browser to send cookies with cross-site requests
- `secure: true` — required by browsers when using `SameSite=None` (HTTPS only)
- `partitioned: true` — supports Chrome's CHIPS for third-party cookie handling

These settings are applied automatically in `authController.js` when `NODE_ENV` is set to `production`. In development, the app falls back to `sameSite: 'lax'` and `secure: false`.

---

## 5. Post-Deployment Checklist

1. Load your Vercel URL. You should see the landing page.
2. Register a new account and log in.
3. Check cookies in DevTools (`Application` -> `Cookies`). The `token` cookie should have `Secure` and `SameSite=None` attributes.
4. Open a document and check that the connection status shows **Live Sync**, confirming the WebSocket connection to Render works.
5. Go back to Render and update `CLIENT_URL` if your Vercel URL changed.
