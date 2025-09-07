# 🎓 Pooja Academy - Educational Institute Platform

<div align="center">

**Comprehensive Educational Management System for Science & Commerce Coaching**

*Empowering 1000+ students in JEE & NEET preparation with modern technology*

[Live Demo](pooja-academy.replit.app) • [Documentation](#) • [Contact](#9958262272)

</div>

## 📚 About Pooja Academy

Pooja Academy is a cutting-edge web application designed for our educational institute in Kirari, Delhi (near Haridas Vatika). Led by Ram Sir with 10+ years of expertise in Physics & Chemistry, we provide structured coaching for Classes 9-12 with a focus on Science and Commerce streams.

## ✨ Key Features

### 🔧 Content Management System
- **Study Notes Upload** - Organized chapter-wise content management
- **Video Lecture Streaming** - Progress tracking and playback features
- **Subject Organization** - Physics, Chemistry, Mathematics, Biology, Accountancy, Business Studies, Economics

### 📊 Admin Dashboard & Analytics
- **Student Management** - University-level tracking system
- **Attendance Monitoring** - Real-time attendance management
- **Results & Leaderboards** - Visual podium displays for top 3 students
- **Progress Tracking** - Gamified learning journey with achievements

### 🔐 Authentication & Security
- **Multi-Login Options** - Phone/Email authentication
- **Role-Based Access** - Student and admin permissions
- **Session Management** - Secure cookie handling

### 📱 Communication Features
- **SMS Notifications** - Automated student alerts via Twilio
- **Real-time Updates** - Instant result notifications
- **Contact System** - Structured inquiry management

### 🗺️ Location & Integration
- **Google Maps** - Institute location integration
- **Payment Gateway** - Razorpay for course enrollments
- **WhatsApp Integration** - Quick student support

## 🚀 Tech Stack

**Frontend**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- Wouter for routing
- TanStack Query for state management
- React Hook Form + Zod validation

**Backend**
- Node.js + Express.js
- PostgreSQL with Drizzle ORM
- Express Sessions for authentication
- WebSocket for real-time features

**External Services**
- Twilio (SMS notifications)
- Razorpay (Payments)
- Google Maps API
- Email services

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Git

Install Dependencies
npm install
Environment Setup
Create .env file in root directory:

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pooja_academy
# Session Secret
SESSION_SECRET=your-secret-key-here
# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
# Razorpay (Optional)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
Database Setup
# Run database migrations
npm run db:push
Start Development Server
npm run dev
Application will be available at pooja-academy.replit.app

📁 Project Structure
pooja-academy/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Data access layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── package.json

🎯 Usage Guide
For Administrators
Login with admin credentials
Navigate to Admin Dashboard
Manage students, upload content, track attendance
Monitor results and generate reports
For Students
Register/Login with phone or email
Access study materials and video lectures
Track learning progress
View results and rankings
🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open a Pull Request
📞 Contact
Ram Sir - Physics & Chemistry Expert
📱 Phone: +91 7011505239
💬 WhatsApp: +91 8800345115
📍 Location: Kirari, Delhi (Near Haridas Vatika)

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Thanks to all 1000+ students who inspired this platform
Special recognition to the development community
Educational technology pioneers who paved the way
<div align="center">
Made with ❤️ for Quality Education

Preparing students for JEE, NEET, and beyond
