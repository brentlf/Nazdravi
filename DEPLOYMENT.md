# 🚀 VeeNutrition Firebase Deployment Guide

This guide covers the complete migration from Express.js to Firebase Functions and deployment to Firebase Hosting.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created (`veenutrition-79fba`)
- Google account with Firebase access

## 🔧 Setup Steps

### 1. Firebase CLI Login
```bash
firebase login
```

### 2. Project Initialization
```bash
firebase use veenutrition-79fba
```

### 3. Environment Variables
Create `.env` file in the `functions` directory:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=veenutrition-79fba
FIREBASE_SERVICE_ACCOUNT=path/to/service-account-key.json

# Email Configuration
ADMIN_EMAIL=admin@veenutrition.com
RESEND_API_KEY=your_resend_api_key

# Other Configuration
NODE_ENV=development
```

## 🏗️ Architecture Overview

### Before (Express.js)
```
Client (React) → Express Server (Port 5000) → Firebase Services
```

### After (Firebase Functions)
```
Client (React) → Firebase Functions → Firebase Services
```

## 🚀 Development Workflow

### Start Development Environment
```bash
# Start both client and functions
npm run dev

# Start only client
npm run dev:client

# Start only functions
npm run dev:functions
```

### Start Firebase Emulators
```bash
# Start all emulators
npm run emulators:all

# Start only functions emulator
npm run emulators:functions

# Start only hosting emulator
npm run emulators:hosting
```

## 📦 Building and Deployment

### Build All
```bash
npm run build
```

### Deploy Everything
```bash
npm run deploy
```

### Deploy Specific Services
```bash
# Deploy only hosting (frontend)
npm run deploy:hosting

# Deploy only functions (backend)
npm run deploy:functions

# Deploy only Firestore rules
npm run deploy:firestore

# Deploy only Storage rules
npm run deploy:storage
```

## 🌐 Firebase Functions Endpoints

### Base URL
- **Development**: `http://localhost:5001/veenutrition-79fba/us-central1/api`
- **Production**: `https://us-central1-veenutrition-79fba.cloudfunctions.net/api`

### Available Endpoints

#### Email Services
- `POST /api/emails/welcome` - Welcome email
- `POST /api/emails/appointment-confirmation` - Appointment confirmation
- `POST /api/emails/reschedule-request` - Reschedule request
- `POST /api/emails/appointment-reminder` - Appointment reminder
- `POST /api/emails/daily-reminders` - Daily reminder batch
- `POST /api/emails/health-update` - Health update notification
- `POST /api/emails/preferences-update` - Preferences update
- `POST /api/emails/invoice-generated` - Invoice notification
- `POST /api/emails/payment-reminder` - Payment reminder
- `POST /api/emails/late-reschedule` - Late reschedule notice
- `POST /api/emails/no-show` - No-show penalty notice
- `POST /api/emails/appointment-cancelled` - Cancellation notice

#### Admin Notifications
- `POST /api/emails/admin/new-appointment` - New appointment alert
- `POST /api/emails/admin/health-update` - Health update alert
- `POST /api/emails/admin/payment-received` - Payment received alert
- `POST /api/emails/admin/plan-upgrade` - Plan upgrade alert
- `POST /api/emails/admin/client-message` - Client message alert
- `POST /api/emails/admin/reschedule-request` - Reschedule request alert

#### Utility
- `GET /api/health` - Health check
- `POST /api/test-email` - Test email endpoint

## 🔒 Security Rules

### Firestore Rules
- Users can only access their own data
- Admins can access all data
- Public resources are readable by everyone
- Admin-only resources require admin role

### Storage Rules
- Users can manage their own files
- Public resources are readable by everyone
- Admin resources require admin authentication
- Profile pictures are publicly readable

## 📊 Database Collections

### Core Collections
- `users` - User profiles and preferences
- `appointments` - Appointment bookings
- `messages` - Client-nutritionist communication
- `progress` - Health and nutrition progress
- `invoices` - Billing and payment records
- `resources` - Educational materials
- `blogPosts` - Blog content
- `plans` - User nutrition plans

### System Collections
- `mail` - Email queue for processing
- `unavailableSlots` - Admin-marked unavailable times
- `translations` - Multi-language content
- `adminUsers` - Admin user management

## 🚨 Error Handling

### Firebase Functions
- Comprehensive error logging
- User-friendly error messages
- Proper HTTP status codes
- Request/response logging

### Client-Side
- React Error Boundaries
- Toast notifications
- Loading states
- Retry mechanisms

## 📱 Performance Optimizations

### Firebase Functions
- Cold start optimization
- Proper timeout configuration
- Batch operations for bulk actions
- Efficient database queries

### Client-Side
- React Query caching
- Lazy loading
- Code splitting
- Bundle optimization

## 🔄 Migration Checklist

### ✅ Completed
- [x] Firebase Functions setup
- [x] Express routes migration
- [x] Security rules configuration
- [x] Database indexes setup
- [x] Client configuration update
- [x] Build scripts update
- [x] Error handling implementation

### 🔄 In Progress
- [ ] Email processing function
- [ ] Background job processing
- [ ] Monitoring and logging

### 📋 Next Steps
- [ ] Set up email processing triggers
- [ ] Implement background job processing
- [ ] Add monitoring and alerting
- [ ] Performance testing
- [ ] Load testing
- [ ] Security audit

## 🧪 Testing

### Local Testing
```bash
# Test functions locally
npm run emulators:functions

# Test API endpoints
curl http://localhost:5001/veenutrition-79fba/us-central1/api/health
```

### Production Testing
```bash
# Deploy to staging
firebase deploy --project veenutrition-staging

# Deploy to production
firebase deploy --project veenutrition-79fba
```

## 📈 Monitoring and Logging

### Firebase Console
- Functions execution logs
- Error reporting
- Performance metrics
- Usage statistics

### Custom Logging
- Request/response logging
- Error tracking
- Performance monitoring
- User activity tracking

## 🚀 Scaling Considerations

### Firebase Functions
- Auto-scaling based on demand
- Regional deployment options
- Memory and timeout configurations
- Cold start optimization

### Database
- Proper indexing strategy
- Query optimization
- Batch operations
- Pagination implementation

## 💰 Cost Optimization

### Firebase Functions
- Monitor execution times
- Optimize cold starts
- Use appropriate memory settings
- Implement caching strategies

### Firestore
- Efficient query patterns
- Proper indexing
- Batch operations
- Data lifecycle management

## 🔧 Troubleshooting

### Common Issues

#### Functions Not Deploying
```bash
# Check build errors
cd functions && npm run build

# Verify TypeScript compilation
cd functions && npx tsc --noEmit
```

#### Emulator Issues
```bash
# Clear emulator cache
firebase emulators:start --only functions --import=./emulator-data

# Check port conflicts
netstat -an | findstr :5001
```

#### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Firebase cache
firebase logout && firebase login
```

## 📞 Support

### Documentation
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Community
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Issues](https://github.com/firebase/firebase-tools/issues)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: VeeNutrition Development Team
