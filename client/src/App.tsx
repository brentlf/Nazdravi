import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { RouteGuard } from "@/components/common/RouteGuard";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Resources from "@/pages/Resources";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Appointment from "@/pages/Appointment";
import ConsentForm from "@/pages/ConsentForm";
import Legal from "@/pages/Legal";
import CzechLegalSummary from "@/pages/CzechLegalSummary";

// Dashboard pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardAppointments from "@/pages/dashboard/DashboardAppointments";
import DashboardMessages from "@/pages/dashboard/DashboardMessages";
import DashboardPlan from "@/pages/dashboard/DashboardPlan";
import DashboardProgress from "@/pages/dashboard/DashboardProgress";
import DashboardResources from "@/pages/dashboard/DashboardResources";

// Admin pages
import AdminHome from "@/pages/admin/AdminHome";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminTranslations from "@/pages/admin/AdminTranslations";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
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
      <Route path="/blog/:slug" component={() => <Layout><BlogPost /></Layout>} />

      <Route path="/consent-form" component={() => <Layout><ConsentForm /></Layout>} />
      <Route path="/appointment" component={() => <Layout><Appointment /></Layout>} />
      <Route path="/legal" component={() => <Layout><Legal /></Layout>} />
      <Route path="/legal/czech-summary" component={() => <Layout><CzechLegalSummary /></Layout>} />
      
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Client dashboard routes */}
      <Route path="/dashboard">
        <RouteGuard role="client">
          <Layout><DashboardHome /></Layout>
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
      
      {/* Admin routes */}
      <Route path="/admin">
        <RouteGuard role="admin">
          <Layout><AdminHome /></Layout>
        </RouteGuard>
      </Route>
      <Route path="/admin/users">
        <RouteGuard role="admin">
          <Layout><AdminUsers /></Layout>
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
      <Route path="/admin/translations">
        <RouteGuard role="admin">
          <Layout><AdminTranslations /></Layout>
        </RouteGuard>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
