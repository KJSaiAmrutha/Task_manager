# 🚀 Anti-Gravity Task Manager

A stunning, production-grade full-stack Project Management Web App featuring an immersive "Anti-Gravity" UI design (glassmorphism, floating elements, glowing gradients) tailored for modern teams. 

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Zustand, Axios
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL (Cloud) / SQLite (Local)
- **Security:** JWT, bcrypt

## 🌟 Key Features
- **Cinematic UI:** Floating cards, soft neon shadows, dynamic micro-animations.
- **Full Role-Based Access:** `ADMIN` vs `MEMBER` privileges.
- **Real-Time Dashboards:** Dynamic charts, stats, and task progression.
- **Task Management:** Priorities, statuses, secure assignments.
- **RESTful Architecture:** Clean modular MVC-pattern backend.

---

## 💻 Local Setup Instructions

1. **Install Dependencies**
   Open terminal and install dependencies for both client and server:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Environment Variables**
   The `.env` files are already pre-configured for local SQLite.
   If you want to use PostgreSQL locally, update the `server/.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
   JWT_SECRET="your_super_secret_key"
   PORT=5000
   ```

3. **Database Migration**
   Initialize the local SQLite database (or Postgres if configured):
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
   ```

4. **Start the Development Servers**
   Open two terminal tabs:
   
   **Tab 1 (Backend Server):**
   ```bash
   cd server
   npm run dev
   ```
   *Runs on http://localhost:5000*
   
   **Tab 2 (Frontend Client):**
   ```bash
   cd client
   npm run dev
   ```
   *Runs on http://localhost:5173*

---

## 🌐 Deployment on Railway (Mandatory Guide)

Deploying a full-stack application on Railway is incredibly straightforward.

### Step 1: Prepare the Repository
Push this entire folder to a new GitHub repository.
Ensure the `server/package.json` contains a postinstall script so Prisma is generated on deployment:
```json
"scripts": {
  "postinstall": "prisma generate && prisma db push",
  "start": "node dist/index.js"
}
```

### Step 2: Railway Dashboard Setup
1. Go to [Railway.app](https://railway.app) and create a New Project.
2. Select **Provision PostgreSQL** to add a managed database.
3. Once the database is ready, click **New Service** -> **GitHub Repo** and connect your repository.

### Step 3: Deploy Backend
1. In your new GitHub service on Railway, set the Root Directory to `/server`.
2. Go to **Variables** and add:
   - `DATABASE_URL` (Reference the PostgreSQL URL from the Railway DB)
   - `JWT_SECRET` (e.g., `production_jwt_secret_123`)
3. Railway will automatically build and deploy the backend. Copy the deployed backend URL (e.g., `https://api.yourproject.up.railway.app`).

### Step 4: Deploy Frontend
1. Click **New Service** -> **GitHub Repo** and choose the same repository again.
2. Set the Root Directory to `/client`.
3. In the Variables section, add your Backend URL:
   - `VITE_API_URL` = `https://api.yourproject.up.railway.app/api`
   *(Note: You will need to update your `client/src/lib/axios.ts` to use `import.meta.env.VITE_API_URL` instead of `localhost:5000`)*
4. Railway will automatically detect it's a Vite app and deploy the static site!

🎉 **Your app is now live with full Database + Backend + Frontend connectivity!**
