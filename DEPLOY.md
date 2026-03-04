# Deploy Tasker to Render

Deploy the **Flask API** as a Web Service and the **React frontend** as a Static Site.

---

## Option A: Deploy with Blueprint (one click)

1. Push your code to GitHub (including `render.yaml` in the repo root).
2. Go to [render.com](https://render.com) → **Dashboard** → **New** → **Blueprint**.
3. Connect the repo; Render will detect `render.yaml` and create both services.
4. After the first deploy:
   - Open the **tasker-api** service and copy its URL (e.g. `https://tasker-api-xxxx.onrender.com`).
   - Open the **tasker** (static site) service and copy its URL (e.g. `https://tasker-xxxx.onrender.com`).
5. Set environment variables:
   - **tasker-api** → Environment → **FRONTEND_URL** = your static site URL (from step 4).
   - **tasker** → Environment → **VITE_API_URL** = your API URL (from step 4).
6. Redeploy both services (or wait for auto-redeploy) so the new env vars are used.

---

## Option B: Create services manually

### 1. Push your code to GitHub

Make sure your repo is pushed and up to date.

---

### 2. Create the Backend (Web Service)

1. Go to [render.com](https://render.com) and sign in.
2. **New** → **Web Service**.
3. Connect your GitHub repo (e.g. `Task-API`).
4. Settings:
   - **Name:** `tasker-api` (or any name).
   - **Root Directory:** leave blank (repo root).
   - **Runtime:** Python 3.
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. **Advanced** → **Add Environment Variable:**
   - `SECRET_KEY` = (generate a long random string for production).
   - `FRONTEND_URL` = leave blank for now; you’ll set it after creating the frontend (e.g. `https://tasker-xxxx.onrender.com`).
6. Click **Create Web Service**.
7. Wait for the first deploy. Copy your API URL (e.g. `https://tasker-api-xxxx.onrender.com`).

---

### 3. Create the Frontend (Static Site)

1. **New** → **Static Site**.
2. Connect the **same** GitHub repo.
3. Settings:
   - **Name:** `tasker` (or any name).
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment** → **Add Environment Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** your backend URL from step 2, e.g. `https://tasker-api-xxxx.onrender.com`  
   - (No trailing slash.)
5. Click **Create Static Site**.
6. After the first deploy, copy the frontend URL (e.g. `https://tasker-xxxx.onrender.com`).

---

### 4. Point the API at the frontend (CORS)

1. Open your **backend** Web Service on Render.
2. **Environment** → edit **FRONTEND_URL** (or add it):
   - **Value:** your static site URL from step 3, e.g. `https://tasker-xxxx.onrender.com`
3. Save. Render will redeploy the backend so CORS allows your frontend.

---

### 5. Done

- **App (frontend):** open the Static Site URL in the browser.
- **API:** the Web Service URL is used by the frontend via `VITE_API_URL`; you can hit `/health` to test.

**Notes:**

- Free Web Services spin down after ~15 min of no traffic; the first request after that can be slow.
- SQLite on the backend is fine for small use; data lives on the service’s disk and can be reset on redeploys. For production you can add a Render PostgreSQL database later and switch the app to it.
