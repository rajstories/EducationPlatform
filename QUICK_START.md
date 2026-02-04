# 🚀 Quick Start - Simplified Public Website

## What You Have Now

A **simple public website** where:
- ✅ **Anyone can browse** (no login needed)
- ✅ View **notes, PYQs, YouTube videos, results**
- ✅ **Only admin** needs password to upload content

---

## How to Run

### 1. Setup Environment (First Time Only)

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/pooja_academy
SESSION_SECRET=your-random-32-char-secret-here
```

### 2. Install & Start

```bash
npm install
npm run dev
```

Visit: `http://localhost:5000`

---

## Your Website Pages

### Public Pages (No Login):
| URL | Description |
|-----|-------------|
| `/` | Home page with institute info |
| `/class/class-9` | Class 9 - Notes, PYQs, Videos, Results |
| `/class/class-10` | Class 10 - Notes, PYQs, Videos, Results |
| `/class/class-11` | Class 11 - Notes, PYQs, Videos, Results |
| `/class/class-12` | Class 12 - Notes, PYQs, Videos, Results |
| `/about` | About the institute |
| `/contact` | Contact form |
| `/results` | Latest results |

### Admin Pages (Password Protected):
| URL | Description |
|-----|-------------|
| `/admin/login` | Admin login page |
| `/admin` | Admin dashboard (upload content) |

---

## For Students/Visitors:

**No login required!** Just visit the website and:

1. **Click on a class** (9, 10, 11, or 12)
2. **Choose what you want:**
   - **Notes** tab → Download study notes PDF
   - **PYQs** tab → Download previous year questions PDF
   - **Videos** tab → Watch YouTube videos
   - **Results** tab → Check test results

---

## For Admin:

### First Time: Create Admin User

You'll need to add an admin user to the database manually. Use a database tool (like pgAdmin) or command line:

```sql
-- Connect to your database
psql postgresql://user:pass@localhost:5432/pooja_academy

-- Insert admin user (use bcrypt hashed password)
INSERT INTO admin_users (username, password, full_name, role, is_active)
VALUES (
  'admin',
  '$2a$10$...',  -- bcrypt hash of your password
  'Administrator',
  'admin',
  true
);
```

**To hash your password**, use an online bcrypt generator or Node.js:
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password', 10));
```

### Upload Content:

1. **Login:** Visit `/admin/login`
2. **Enter:** username and password
3. **Upload content:**
   - **Notes:** Click "Notes" tab → Upload PDF
   - **PYQs:** Click "PYQs" tab → Upload PDF
   - **Videos:** Click "Videos" tab → Add YouTube URL
   - **Results:** Click "Results" tab → Publish results

---

## Content Types

### 1. Notes (PDF Files)
- Upload study notes for each chapter
- Students can download directly
- Organized by: Class → Subject → Chapter

### 2. PYQs (PDF Files)
- Upload previous year question papers
- Students can download and practice
- Organized by: Class → Subject

### 3. Videos (YouTube Links)
- Add your YouTube video URLs
- Videos embed directly on the page
- Format: `https://www.youtube.com/watch?v=VIDEO_ID`

### 4. Results
- Publish test results
- Show student rankings
- Display on results page

---

## File Structure

```
Your Website/
├── Public Pages (No login)
│   ├── Home
│   ├── Classes (9, 10, 11, 12)
│   │   ├── Notes
│   │   ├── PYQs
│   │   ├── Videos
│   │   └── Results
│   ├── About
│   └── Contact
│
└── Admin Panel (Password protected)
    └── Upload Content
```

---

## Features Removed

We removed these features you didn't need:
- ❌ Student login/registration
- ❌ Student profiles
- ❌ Attendance tracking
- ❌ Fee management
- ❌ Student dashboard
- ❌ Progress tracking
- ❌ Achievements
- ❌ OTP system

---

## Need Help?

Check these files:
- `.gemini/SIMPLIFICATION_COMPLETE.md` - Full details of changes
- `.gemini/simplified_plan.md` - Original simplification plan
- `GETTING_STARTED.md` - Original setup guide

---

## Common Tasks

### Update Institute Name
Edit `client/src/pages/Home.tsx` - Change "Pooja Academy" to your institute name

### Add More Classes
Edit database `classes` table or seed data

### Change Colors/Styling
Edit `client/src/index.css` - Tailwind configuration

### Add Institute Logo
Add logo to `Header.tsx` component

---

**Your simple institute website is ready!** 🎉

Just run `npm run dev` and start uploading content from the admin dashboard.
