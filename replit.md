# Vee Nutrition Platform

## Overview

Vee Nutrition is a full-stack web application providing professional nutrition consultation services. The platform connects registered dietitians with clients through a comprehensive system that includes appointment booking, real-time messaging, nutrition plan management, document sharing, and payment processing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: React Query (@tanstack/react-query) for server state
- **Styling**: Tailwind CSS with custom design system using shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Payment Integration**: Stripe React components

### Backend Architecture
- **Runtime**: Node.js with TypeScript (tsx for development)
- **Framework**: Express.js
- **Database**: Firebase Firestore (with optional Drizzle ORM for PostgreSQL fallback)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Email Services**: Resend API for transactional emails
- **Payment Processing**: Stripe for invoice and payment management

### Build System
- **Bundler**: Vite for frontend development and production builds
- **Development**: Hot module replacement with Vite dev server
- **Production**: ESBuild for server-side bundling

## Key Components

### Authentication & Authorization
- Firebase Authentication with Google OAuth integration
- Role-based access control (client/admin)
- Route guards for protected pages
- Admin client viewing capability for support purposes

### Appointment Management
- Real-time appointment booking system
- Microsoft Teams integration for video consultations
- Cancellation policy enforcement with working hours calculations
- Automated email notifications for appointment lifecycle events

### Messaging System
- Real-time chat between clients and nutritionists
- Firebase Firestore for message persistence
- Support for text messages and file sharing
- Admin broadcast capabilities

### Document & Plan Management
- Firebase Storage for secure document uploads
- PDF generation for nutrition plans and invoices
- Client document access control
- Progress tracking with charts and analytics

### Payment & Invoicing
- Stripe integration for payment processing
- Automated invoice generation for appointments
- Service plan management (pay-as-you-go vs complete program)
- Late reschedule and no-show penalty system

### Internationalization
- Multi-language support (English/Czech)
- Language context provider for dynamic content
- Localized email templates
- Region-specific legal compliance features

## Data Flow

### User Registration & Onboarding
1. User creates account via Firebase Auth
2. User profile created in Firestore with role assignment
3. Consent form completion for legal compliance
4. Welcome email sent via Resend service
5. Dashboard access granted based on role

### Appointment Booking Flow
1. Client selects available time slot
2. Appointment created with "pending" status
3. Admin receives notification for confirmation
4. Microsoft Teams meeting auto-generated
5. Confirmation emails sent to all parties
6. Calendar reminders scheduled

### Payment Processing
1. Invoice generated after appointment completion
2. Stripe PaymentIntent created with client details
3. Payment link sent via email
4. Payment confirmation triggers invoice status update
5. Receipt generation and delivery

## External Dependencies

### Core Services
- **Firebase**: Authentication, Firestore database, Storage, Functions
- **Stripe**: Payment processing and invoice management
- **Resend**: Transactional email delivery
- **Microsoft Graph API**: Teams meeting generation

### Development Tools
- **Replit**: Cloud development environment
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon system
- **date-fns**: Date manipulation utilities
- **React Hook Form**: Form state management

## Deployment Strategy

### Development Environment
- Replit cloud IDE with PostgreSQL and Node.js modules
- Hot reload development server on port 5000
- Firebase emulators for local testing

### Production Deployment
- Autoscale deployment target on Replit
- Build process: `npm run build` (Vite + ESBuild)
- Production server: `npm run start`
- Environment variables managed through Replit secrets

### Database Strategy
- Primary: Firebase Firestore for real-time features
- Fallback: PostgreSQL with Drizzle ORM (configurable)
- Schema definitions in shared directory for consistency

### Security Considerations
- Firebase Security Rules for data access control
- HTTPS enforcement for all endpoints
- Input validation with Zod schemas
- Secure file upload with type restrictions

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### June 15, 2025
- ✓ Implemented proper chat messaging with auto-scroll functionality 
- ✓ Fixed unread message counts with red indicators for admin client list
- ✓ Updated message backgrounds (light blue for sender, light green for receiver)
- ✓ Applied consistent appointment status colors across client and admin dashboards
- ✓ Simplified About page layout by removing images and 3-column structure below banner
- ✓ Verified blog posts functionality - Firebase "blogs" collection working correctly

## Current Status

### Working Features
- Firebase Authentication and Firestore database connectivity
- Real-time messaging system with proper visual indicators
- Appointment management with consistent status colors
- Blog post display from Firebase "blogs" collection
- Clean About page design without distracting side images
- Admin dashboard with client management capabilities

### Active Collections
- `blogs` - Blog posts and articles
- `messages` - Real-time chat messages
- `appointments` - Appointment scheduling data
- `users` - User profiles and authentication data

## Changelog

- June 15, 2025. Initial setup and core feature implementations