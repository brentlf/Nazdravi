import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { RouteGuard } from "@/components/common/RouteGuard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Appointment from "@/pages/Appointment";
import ConsentForm from "@/pages/ConsentForm";
import Legal from "@/pages/Legal";
import CzechLegalSummary from "@/pages/CzechLegalSummary";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";

// Dashboard pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardCalendar from "@/pages/dashboard/DashboardCalendar";
import DashboardAppointments from "@/pages/dashboard/DashboardAppointments";
import DashboardMessages from "@/pages/dashboard/DashboardMessages";
import DashboardPlan from "@/pages/dashboard/DashboardPlan";
import DashboardProgress from "@/pages/dashboard/DashboardProgress";
import DashboardResources from "@/pages/dashboard/DashboardResources";
import DashboardDocuments from "@/pages/dashboard/DashboardDocuments";
import DashboardInvoices from "@/pages/dashboard/DashboardInvoices";
import DashboardProfile from "@/pages/dashboard/DashboardProfile";
import AdminClientView from "@/pages/dashboard/AdminClientView";

// Admin pages
import AdminHome from "@/pages/admin/AdminHome";
import AdminCalendar from "@/pages/admin/AdminCalendar";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminAvailability from "@/pages/admin/AdminAvailability";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminUserProfile from "@/pages/admin/AdminUserProfile";
import AdminCleanupUsers from "@/pages/admin/AdminCleanupUsers";
import PayInvoice from "@/pages/PayInvoice";
import AdminEmailScheduler from "@/pages/admin/AdminEmailScheduler";
import InvoiceView from "@/pages/invoice/InvoiceView";

// Component to manage body class for scrolling
function BodyClassManager() {
  const [location] = useLocation();
  
  useEffect(() => {
    const isBlogPage = location === "/blog";
    const isHomePage = location === "/";
    
    // Remove all scroll-related classes first
    document.body.classList.remove('scrollable-page', 'home-page');
    
    if (isBlogPage) {
      document.body.classList.add('scrollable-page');
    } else if (isHomePage) {
      document.body.classList.add('home-page');
    }
    
    // Prevent scrolling on non-blog and non-home pages
    const preventScroll = (e: Event) => {
      if (!isBlogPage && !isHomePage) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Add event listeners to prevent scrolling
    if (!isBlogPage && !isHomePage) {
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('keydown', (e) => {
        // Prevent arrow keys, page up/down, home, end from scrolling
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
          e.preventDefault();
        }
      });
    }
    
    // Cleanup on unmount or route change
    return () => {
      document.body.classList.remove('scrollable-page', 'home-page');
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [location]);
  
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHomePage = location === "/";
  const isDashboardRoute = location.startsWith("/dashboard") || location.startsWith("/admin");
  const isBlogPage = location === "/blog";
  const isServicesPage = location === "/services";
  const isAboutPage = location === "/about";
  const isContactPage = location === "/contact";
  const allowScrolling = isBlogPage || isAboutPage || isHomePage;
  
  // Don't show footer on home, dashboard, admin, services, about, blog, or contact pages
  const showFooter = !isHomePage && !isDashboardRoute && !isServicesPage && !isAboutPage && !isBlogPage && !isContactPage;
  
  return (
    <div className={`${allowScrolling ? 'w-full h-screen overflow-y-auto' : 'flex-layout bg-background text-foreground h-screen overflow-hidden'}`}>
      {!isHomePage && <Header />}
      <main className={`${allowScrolling ? 'w-full' : 'flex-content'} ${!isHomePage ? 'pt-28' : ''}`}>
        {children}
      </main>
      {showFooter && (
        <Footer />
      )}
      {!isHomePage && <MobileBottomNav />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/about" component={() => <Layout><About /></Layout>} />
      <Route path="/services" component={() => <Layout><Services /></Layout>} />
      <Route path="/blog" component={() => <Layout><Blog /></Layout>} />
      <Route path="/blog/post" component={() => <Layout><BlogPost /></Layout>} />
      <Route path="/contact" component={() => <Layout><Contact /></Layout>} />

      <Route path="/consent-form" component={() => <Layout><ConsentForm /></Layout>} />
      <Route path="/appointment" component={() => <Layout><Appointment /></Layout>} />
      <Route path="/legal" component={() => <Layout><Legal /></Layout>} />
      <Route path="/legal/czech-summary" component={() => <Layout><CzechLegalSummary /></Layout>} />
      <Route path="/privacy-policy" component={() => <Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms-of-service" component={() => <Layout><TermsOfService /></Layout>} />
      <Route path="/cookie-policy" component={() => <Layout><CookiePolicy /></Layout>} />
      
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Payment route */}
      <Route path="/pay-invoice/:invoiceNumber" component={() => <Layout><PayInvoice /></Layout>} />
      
      {/* Client dashboard routes */}
      <Route path="/dashboard">
        <RouteGuard role="client">
          <Layout><DashboardHome /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/calendar">
        <RouteGuard role="client">
          <Layout><DashboardCalendar /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/appointments">
        <RouteGuard role="client">
          <Layout><DashboardAppointments /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/messages">
        <RouteGuard role="client">
          <Layout><DashboardMessages /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/plan">
        <RouteGuard role="client">
          <Layout><DashboardPlan /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/progress">
        <RouteGuard role="client">
          <Layout><DashboardProgress /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/resources">
        <RouteGuard role="client">
          <Layout><DashboardResources /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/documents">
        <RouteGuard role="client">
          <Layout><DashboardDocuments /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/invoices">
        <RouteGuard role="client">
          <Layout><DashboardInvoices /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard/profile">
        <RouteGuard role="client">
          <Layout><DashboardProfile /></Layout>
        </RouteGuard>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <RouteGuard role="admin">
          <Layout><AdminHome /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/calendar">
        <RouteGuard role="admin">
          <Layout><AdminCalendar /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/users">
        <RouteGuard role="admin">
          <Layout><AdminUsers /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/users/:userId">
        <RouteGuard role="admin">
          <Layout><AdminUserProfile /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/cleanup">
        <RouteGuard role="admin">
          <Layout><AdminCleanupUsers /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/appointments">
        <RouteGuard role="admin">
          <Layout><AdminAppointments /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/messages">
        <RouteGuard role="admin">
          <Layout><AdminMessages /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/plans">
        <RouteGuard role="admin">
          <Layout><AdminPlans /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/availability">
        <RouteGuard role="admin">
          <Layout><AdminAvailability /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/documents">
        <RouteGuard role="admin">
          <Layout><AdminDocuments /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/blog">
        <RouteGuard role="admin">
          <Layout><AdminBlog /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/emails">
        <RouteGuard role="admin">
          <Layout><AdminEmailScheduler /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/invoices">
        <RouteGuard role="admin">
          <Layout><AdminInvoices /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin-client-view">
        <RouteGuard role="admin">
          <Layout><AdminClientView /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/invoice/:id">
        <RouteGuard role="admin">
          <Layout><InvoiceView /></Layout>
        </RouteGuard>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <BodyClassManager />
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
