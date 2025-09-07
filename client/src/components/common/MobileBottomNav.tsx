import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Calendar, MessageCircle, FileText, User, Users, Receipt, CalendarDays } from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  ariaLabel: string;
};

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isClientDashboard = location.startsWith("/dashboard");
  const isAdminDashboard = location.startsWith("/admin");

  // Prefer route prefix over role so deep-links render correct nav
  const clientItems: NavItem[] = [
    { label: "Home", icon: Home, href: "/dashboard", ariaLabel: "Client dashboard home" },
    { label: "Calendar", icon: CalendarDays, href: "/dashboard/calendar", ariaLabel: "Calendar view" },
    { label: "Appts", icon: Calendar, href: "/dashboard/appointments", ariaLabel: "Appointments" },
    { label: "Chat", icon: MessageCircle, href: "/dashboard/messages", ariaLabel: "Messages" },
    { label: "Me", icon: User, href: "/dashboard/profile", ariaLabel: "Profile" },
  ];

  const adminItems: NavItem[] = [
    { label: "Home", icon: Home, href: "/admin", ariaLabel: "Admin dashboard home" },
    { label: "Calendar", icon: CalendarDays, href: "/admin/calendar", ariaLabel: "Admin calendar view" },
    { label: "Users", icon: Users, href: "/admin/users", ariaLabel: "Users" },
    { label: "Appts", icon: Calendar, href: "/admin/appointments", ariaLabel: "Appointments" },
    { label: "Chat", icon: MessageCircle, href: "/admin/messages", ariaLabel: "Messages" },
  ];

  const items = isAdminDashboard ? adminItems : clientItems;

  // Hide if not on a dashboard route or on medium+ screens
  if (!isClientDashboard && !isAdminDashboard) return null;

  return (
    <nav
      className={cn(
        "sm:hidden fixed bottom-0 left-0 right-0 z-50",
        "border-t border-border bg-card/95 backdrop-blur-sm text-card-foreground"
      )}
      role="navigation"
      aria-label={isAdminDashboard ? "Admin bottom navigation" : "Client bottom navigation"}
    >
      <ul className="grid grid-cols-5 px-safe pb-safe">
        {items.map(({ label, icon: Icon, href, ariaLabel }) => {
          const active = location === href;
          return (
            <li key={href} className="">
              <Link href={href}>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center h-16 text-xs font-medium cursor-pointer",
                    "text-muted-foreground hover:text-foreground",
                    active && "text-primary"
                  )}
                  aria-label={ariaLabel}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("h-5 w-5", active ? "scale-110" : "opacity-80")} />
                  <span className="mt-1 leading-none">{label}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileBottomNav;


