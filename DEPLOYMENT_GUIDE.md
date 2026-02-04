# 🚀 Quick Deployment Guide - Pooja Academy

## ⚡ Fastest Option: Vercel + Neon Database (10 minutes)

### Step 1: Deploy Database (3 minutes)

1. **Go to [Neon.tech](https://neon.tech)** and sign up (free)
2. **Create a new project** called "Pooja Academy"
3. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb
   ```
4. **Keep this tab open** - you'll need it in Step 3

### Step 2: Prepare Your Code (2 minutes)

**Create `vercel.json` in your project root:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### Step 3: Deploy to Vercel (5 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub
2. **Click "Import Project"**
3. **Import your GitHub repository** (push your code to GitHub first if needed)
4. **Add Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=<paste your Neon connection string>
   SESSION_SECRET=<generate random string>
   NODE_ENV=production
   ```
5. **Deploy!** ✅

### Step 4: Initialize Database

After deployment, run migrations:
```bash
npm run db:push
```

**Your site will be live at:** `https://your-project.vercel.app`

---

## 🎯 Alternative: Render (Full-Stack) - 15 minutes

### Step 1: Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Name it: `pooja-academy-db`
3. Choose **Free** plan
4. Click **"Create Database"**
5. **Copy the Internal Database URL**

### Step 3: Deploy Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `pooja-academy`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   ```
   DATABASE_URL=<paste internal database URL>
   SESSION_SECRET=<random 32-char string>
   NODE_ENV=production
   PORT=5000
   ```

5. Click **"Create Web Service"**

### Step 4: Run Database Migrations

After deployment, go to **Shell** tab in Render and run:
```bash
npm run db:push
```

**Your site will be live at:** `https://pooja-academy.onrender.com`

---

## 🛠️ Alternative: Railway (Easiest) - 12 minutes

### Quick Deploy

1. **Go to [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**
5. Railway will auto-detect Node.js and PostgreSQL needs
6. **Add Environment Variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SESSION_SECRET=<random string>
   NODE_ENV=production
   ```
7. **Deploy!**

Railway automatically:
- Creates PostgreSQL database
- Sets up environment
- Deploys your app

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] `.env.example` file (✅ Already have)
- [ ] All secrets removed from code (✅ Done)
- [ ] Build script in package.json (✅ Have it)
- [ ] Database migrations ready (✅ Have `db:push`)
- [ ] Environment validation (✅ Already implemented)

---

## 🔐 Required Environment Variables

All platforms need these:

```bash
# Database (provided by hosting platform or Neon)
DATABASE_URL=postgresql://...

# Security (generate random 32+ character string)
SESSION_SECRET=your-random-secret-here

# Environment
NODE_ENV=production
PORT=5000

# Optional - Twilio (if you want SMS features)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
ADMIN_NOTIFICATION_PHONE=+919876543210
```

---

## 🎨 After Deployment

### 1. Create First Admin User

Connect to your database and run:
```sql
INSERT INTO admin_users (username, password, full_name, role, is_active)
VALUES (
  'admin',
  '$2a$10$...',  -- Use bcrypt to hash your password
  'Administrator',
  'admin',
  true
);
```

Or use this Node.js script:
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password-here', 10));
```

### 2. Test Your Site

- ✅ Visit homepage
- ✅ Test class pages
- ✅ Login to admin at `/admin/login`
- ✅ Upload test content

### 3. Custom Domain (Optional)

All platforms support custom domains:
- Vercel: Settings → Domains
- Render: Settings → Custom Domain
- Railway: Settings → Domains

---

## 🆘 Troubleshooting

### Build Fails
- Check node version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for errors

### Database Connection Error
- Verify DATABASE_URL is correct
- Check if database is in same region
- Run `npm run db:push` to create tables

### 500 Errors
- Check server logs
- Verify all environment variables are set
- Check SESSION_SECRET is set

---

## 🎉 Quick Start Summary

**Fastest Route (Vercel + Neon):**
1. Create Neon database (3 min)
2. Push code to GitHub (2 min)
3. Deploy to Vercel (5 min)
4. Add environment variables
5. Run database migrations
6. **Done!** 🚀

**Your education platform will be live and accessible worldwide!**

---

*Last Updated: February 4, 2026*
