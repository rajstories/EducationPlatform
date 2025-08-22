# Pooja Academy - Educational Institute Platform

## Overview

Pooja Academy is a modern web application for an educational institute located in Kirari, Delhi (near Haridas Vatika) that provides Science and Commerce coaching for students from Classes 9-12. Led by Ram Sir with 10+ years of experience in Physics & Chemistry, the platform offers structured course content, downloadable notes, previous year questions (PYQs), and enrollment functionality. The institute has successfully taught over 1000+ students with a focus on JEE and NEET preparation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless for scalable data storage
- **API Design**: RESTful API endpoints with proper error handling and logging
- **File Structure**: Monorepo structure with shared schema between frontend and backend

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless platform
- **Schema Management**: Drizzle Kit for database migrations and schema changes
- **Data Models**: Structured models for users, classes, subjects, chapters, contact submissions, and enrollments
- **Storage Pattern**: In-memory storage implementation with interface for easy database switching

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User System**: Basic user authentication with username/password
- **Security**: Input validation with Zod schemas and sanitization

### Design System
- **Color Palette**: Navy blue primary (#1a2b4c), sky blue accents (#e0f7fa), sage green highlights (#e8f5e9)
- **Typography**: Poppins font family for clean, readable text
- **Layout**: Grid-based responsive design with card components
- **Components**: Comprehensive UI component library with Radix UI primitives

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation and type inference

### UI and Styling
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Payment Integration
- **Razorpay**: Payment gateway integration for course enrollments
- **UPI**: Alternative payment method support

### Communication
- **Contact Number**: +91 7011505239 (Ram Sir)
- **WhatsApp Number**: +91 8800345115 (Contact Us)
- **Email Service**: Planned integration for notifications and course access
- **Contact Forms**: Structured contact submission system with database storage
- **Location**: Kirari, Delhi - Near Haridas Vatika