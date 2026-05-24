# Part 14: Production Deployment

In this guide, you will transition your application from your local machine to the cloud. You will learn how to configure a free-tier MongoDB Atlas cluster, deploy your Node/WebSocket server to Render, deploy your React frontend to Vercel, and resolve the common Single Page App (SPA) page-reload 404 error.

---

## 1. Hosting Database on MongoDB Atlas

To let your cloud backend write document data, you need a highly available cloud database:

1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (Free tier).
3. **Database Access**: Create a database user with read/write permissions. Keep the password secure!
4. **Network Access**: Add IP address `0.0.0.0/0` (Allow Access from Anywhere) so your Render backend servers can connect.
5. Click **Connect** -> Choose **Drivers** -> Copy your Mongoose connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/collaborative_editor?retryWrites=true&w=majority
   ```

---

## 2. Deploying Backend Service (Render)

Render is an excellent platform for deploying Node applications with native WebSocket support.

1. Commit your codebase to a GitHub Repository.
2. Log into [Render](https://render.com) and click **New** -> **Web Service**.
3. Link your GitHub Repository.
4. Configure the following parameters:
   * **Runtime**: `Node`
   * **Build Command**: `cd backend && npm install`
   * **Start Command**: `cd backend && npm start`
5. Click **Advanced** and add the following Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (Render binds this dynamically)
   * `MONGO_URI`: `your_mongodb_atlas_connection_string`
   * `JWT_SECRET`: `your_random_long_production_cryptographic_secret`
   * `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Click **Deploy Web Service**. Render will output a live URL (e.g., `https://editor-api.onrender.com`).

> [!WARNING]
> Remember to update your backend CORS cookie policy settings for production!
> In `backend/controllers/authController.js`, ensure you set `secure: true` (only send cookies over HTTPS) and `sameSite: 'none'` (cross-domain cookies) during production deployment cycles.

---

## 3. Deploying Frontend Application (Vercel)

Vercel is optimized for building and serving lightning-fast React applications.

### Handling Vercel SPA Routing (Vercel Redirect Rules)
By default, React uses client-side routing. If a user reloads `https://your-app.vercel.app/document/123` directly in their browser address bar, Vercel will attempt to look for a physical folder named `/document/123` on its server, resulting in a **404 Not Found** error.

To solve this, create a redirect rewrite rule configuration file at the root of your `frontend/` folder.

#### Creating Routing Rules (`frontend/vercel.json`)
Create `frontend/vercel.json` and paste this code:

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

### Deploying via Vercel
1. Log into [Vercel](https://vercel.com) and link your GitHub Repository.
2. Select your project folder, and configure:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
3. Add your Environment Variables:
   * `VITE_API_URL`: `https://your-editor-api.onrender.com/api`
   * `VITE_SOCKET_URL`: `https://your-editor-api.onrender.com`
4. Click **Deploy**. Vercel will build your static files and provide your production URL.

---

## 4. Production Environment Check

Verify these settings once deployed:
1. Load your Vercel URL. You should be greeted with your login panel.
2. Inspect cookies in Chrome DevTools (`Application` -> `Cookies`). Ensure your `token` cookie has the `Secure` and `SameSite=None` attributes checked.
3. Open a document and check the top right badge. It should transition from "Reconnecting..." to **Live Sync**, indicating a successful WebSocket connection to your Render server.

Your MERN Mapped Editor is now fully deployed and live on cloud servers! Next, we will discuss advanced conflict resolution and future feature upgrades.
