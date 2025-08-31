# Nazdravi - Pure Firebase Architecture

A comprehensive nutrition consulting services platform built with **React + Firebase** - no Express server needed! 🚀

## 🏗️ **Architecture Overview**

```
Client (React) → Firebase Services (Auth, Firestore, Storage, Functions)
                ↓
            External Services (Resend for emails, Stripe for payments)
```

### **What We Removed:**
- ❌ Express.js server
- ❌ Complex server-side routing
- ❌ Server management overhead
- ❌ Development/production server differences

### **What We Kept:**
- ✅ **Firebase Authentication** - User management
- ✅ **Firebase Firestore** - Database operations
- ✅ **Firebase Storage** - File storage
- ✅ **Firebase Functions** - Serverless backend (emails, triggers)
- ✅ **Firebase Hosting** - Static website hosting

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Firebase CLI (`npm install -g firebase-tools`)
- Resend account for email sending

### **1. Setup Firebase Project**
```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select: Hosting, Functions, Firestore, Storage
```

### **2. Install Dependencies**
```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install

# Functions dependencies
cd ../functions && npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cd functions
cp env.example .env

# Edit .env with your Resend API key
RESEND_API_KEY=your_actual_resend_api_key
```

### **4. Development**
```bash
# Start client development server
npm run dev:client

# In another terminal, start Firebase emulators
npm run emulators
```

### **5. Build & Deploy**
```bash
# Build everything
npm run build

# Deploy to Firebase
npm run deploy

# Or deploy specific parts
npm run deploy:hosting    # Just the website
npm run deploy:functions  # Just the backend functions
```

## 📧 **Email System (Resend + Firebase Functions)**

### **Available Email Functions:**
- `sendWelcomeEmail` - New user welcome
- `sendAppointmentConfirmation` - Booking confirmations
- `sendInvoiceEmail` - Invoice notifications

### **Automatic Triggers:**
- **Appointment Created** → Sends confirmation email
- **Invoice Created** → Sends invoice email

### **Manual Calls:**
```typescript
import { emailService } from './lib/emailService';

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Send appointment confirmation
await emailService.sendAppointmentConfirmation(
  'user@example.com', 
  'John Doe', 
  '2024-01-15', 
  '14:00',
  'https://meet.google.com/abc-xyz',
  'Initial Consultation'
);
```

## 🔥 **Firebase Functions Endpoints**

### **Base URLs:**
- **Development:** `http://localhost:5001/veenutrition-79fba/us-central1/api`
- **Production:** `https://us-central1-veenutrition-79fba.cloudfunctions.net/api`

### **Available Endpoints:**
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `GET /` - API info and available functions

### **Callable Functions:**
- `sendWelcomeEmail` - Callable function for welcome emails
- `sendAppointmentConfirmation` - Callable function for appointment confirmations
- `sendInvoiceEmail` - Callable function for invoice emails

## 🗄️ **Database Collections**

### **Core Collections:**
- `users` - User profiles and preferences
- `appointments` - Booking information
- `invoices` - Payment records
- `emailLogs` - Email delivery tracking
- `messages` - Client communication
- `progress` - Health progress tracking

### **Security Rules:**
- **Users:** Can read/write their own data
- **Appointments:** Users can manage their own, admins can see all
- **Invoices:** Users can view their own, admins can manage all
- **Email Logs:** Admin-only access for monitoring

## 🛡️ **Security & Best Practices**

### **Firestore Rules:**
- Role-based access control (admin/user)
- User data isolation
- Admin override capabilities
- Input validation at function level

### **Functions Security:**
- Input validation with TypeScript
- Error handling and logging
- Rate limiting (Firebase handles this)
- Environment variable protection

## 📱 **Client Features**

### **Core Functionality:**
- **User Authentication** - Google OAuth via Firebase
- **Appointment Booking** - Real-time availability
- **Blog Reading** - Nutrition articles and tips
- **Invoice Management** - View and pay invoices
- **Progress Tracking** - Health journey monitoring
- **Multi-language Support** - i18n system

### **UI Components:**
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - User preference support

## 🚀 **Deployment Workflow**

### **1. Local Development**
```bash
npm run dev:client          # React dev server
npm run emulators           # Firebase emulators
```

### **2. Testing**
```bash
npm run check              # TypeScript checks
npm run build              # Build everything
```

### **3. Production Deploy**
```bash
npm run deploy             # Deploy everything
# OR
npm run deploy:hosting     # Just website
npm run deploy:functions   # Just backend
```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Functions Not Loading:**
```bash
# Check emulator status
firebase emulators:start --only functions

# Check logs
firebase functions:log
```

#### **Email Not Sending:**
- Verify `RESEND_API_KEY` in `.env`
- Check Firebase Functions logs
- Verify email service configuration

#### **Build Errors:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild functions
cd functions && npm run build
```

### **Performance Tips:**
- Use Firebase Functions warm-up for critical functions
- Implement proper caching strategies
- Monitor function execution times
- Use Firestore indexes for complex queries

## 📈 **Scaling & Monitoring**

### **Firebase Console:**
- **Functions:** Monitor execution times and errors
- **Firestore:** Query performance and usage
- **Hosting:** CDN performance and caching
- **Authentication:** User activity and security

### **Custom Monitoring:**
- Email delivery tracking in `emailLogs`
- User engagement metrics
- Performance analytics
- Error reporting

## 💰 **Cost Optimization**

### **Firebase Functions:**
- Use appropriate memory allocation
- Implement function warm-up for critical paths
- Monitor execution frequency
- Use regional deployment for better performance

### **Firestore:**
- Optimize query patterns
- Use appropriate indexes
- Monitor read/write operations
- Implement efficient data structures

## 🆘 **Support & Resources**

### **Documentation:**
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security)
- [Resend API](https://resend.com/docs/api-reference)

### **Community:**
- Firebase Community Discord
- Stack Overflow Firebase tag
- GitHub Issues for this project

---

**🎉 You now have a production-ready, scalable nutrition platform running entirely on Firebase!**

No more server management, automatic scaling, and everything in one place. Perfect for a growing business! 🚀
