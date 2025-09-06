import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Prevent page scroll on home load; restore on unmount
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "Book Appointment", href: "/appointment" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDashboardClick = () => {
    if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-[100svh] overflow-hidden">
      {/* Full Viewport Hero Section with Background Image */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/oranges-sky.jpg)`,
            imageRendering: 'crisp-edges',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)'
          }}
        />
        
        {/* Light overlay for better text readability while maintaining image clarity */}
        <div className="absolute inset-0 bg-black/25 sm:bg-black/15" />
        
        {/* Header overlay - positioned at top */}
        <div className="relative z-20 w-full">
          {/* Top left logo and account section */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-8 flex items-center gap-3 sm:gap-4 px-safe pt-safe">
            {/* Logo placeholder */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/40 rounded-md"></div>
            </div>
            
            {/* Account section with dropdown for logged-in users */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span 
                    className="text-white text-base sm:text-lg font-light tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer tap-target"
                    style={{fontFamily: 'Calibri, sans-serif'}}
                  >
                    {user.role === "admin" ? "admin panel" : "my account"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 p-2" 
                  align="start"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center justify-start gap-3 p-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white text-sm">{user.name}</p>
                      <p className="text-xs text-white/70 truncate w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={handleDashboardClick}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 text-white focus:text-white cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/20 text-red-300 focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span 
                className="text-white text-base sm:text-lg font-light tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer tap-target"
                style={{fontFamily: 'Calibri, sans-serif'}}
                onClick={() => setLocation("/login")}
              >
                sign in
              </span>
            )}
          </div>

          {/* Mobile burger menu (home-only, not header) */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 lg:hidden flex items-center gap-2 px-safe pt-safe">
            <ThemeToggle className="text-white hover:bg-white/20 tap-target" />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-11 w-11 sm:h-10 sm:w-10 rounded-md z-50 tap-target-lg ${
                    menuOpen
                      ? "bg-white text-foreground hover:bg-white shadow-md"
                      : "text-white hover:bg-white/20"
                  }`}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[82vw] max-w-[360px] px-safe">
                <nav className="mt-6 space-y-2">
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                      <div className="px-4 py-4 rounded-lg text-lg font-medium cursor-pointer text-foreground hover:bg-muted/80 tap-target">
                        {item.name}
                      </div>
                    </Link>
                  ))}
                </nav>
                {!user && (
                  <div className="pt-4 pb-safe space-y-3">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center tap-target">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full justify-center tap-target">Get Started</Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main content with navigation on the right */}
        <div className="relative z-10 h-full flex items-end pb-24 sm:pb-20">
          <div className="w-full pl-4 sm:pl-8 pr-4 sm:pr-6 px-safe">
            <div className="flex items-end justify-between h-full w-full">
              {/* Left side - Main content positioned at bottom left */}
              <div className="max-w-4xl -ml-2 sm:-ml-4">
                {/* Main title "nazdravi" raised from the image */}
                <h1 className="text-6xl xs:text-7xl sm:text-9xl lg:text-[12rem] xl:text-[14rem] font-extralight mb-3 sm:mb-2 leading-tight text-white text-balance" 
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7), -1px -1px 3px rgba(255,255,255,0.25), 1px 1px 2px rgba(255,255,255,0.15)',
                      filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.55))'
                    }}>
                  nazdravi
                </h1>
                
                {/* Centered content under nazdravi */}
                <div className="flex flex-col items-center">
                  {/* Subtitle "REGISTERED DIETITIAN" centered under nazdravi - larger font */}
                  <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-8 sm:mb-10 text-white font-light tracking-wide opacity-90 text-center text-balance"
                     style={{fontFamily: 'DM Sans, sans-serif'}}>
                    REGISTERED DIETITIAN
                  </p>
                  
                  {/* BOOK AN APPOINTMENT button centered - larger */}
                  <Link href="/appointment">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg xs:text-xl sm:text-2xl px-7 sm:px-12 py-5 sm:py-8 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:border-white/60 hover:scale-105 tap-target"
                      style={{fontFamily: 'DM Sans, sans-serif'}}
                    >
                      BOOK AN APPOINTMENT
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right lower corner - Navigation menu with elegant styling */}
              <div className="hidden lg:flex flex-col items-end space-y-6 absolute bottom-12 right-12 hide-on-mobile">
                <Link href="/">
                  <div className="text-white text-5xl xl:text-6xl font-light hover:text-white/80 transition-all duration-300 cursor-pointer border-b border-white/30 pb-2 tracking-[0.2em]" 
                       style={{
                         fontFamily: 'DM Sans, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                         filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                       }}>
                    HOME
                  </div>
                </Link>
                <Link href="/about">
                  <div className="text-white/90 text-5xl xl:text-6xl font-light hover:text-white transition-all duration-300 cursor-pointer tracking-[0.2em]" 
                       style={{
                         fontFamily: 'DM Sans, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                         filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                       }}>
                    ABOUT
                  </div>
                </Link>
                <Link href="/services">
                  <div className="text-white/90 text-5xl xl:text-6xl font-light hover:text-white transition-all duration-300 cursor-pointer tracking-[0.2em]" 
                       style={{
                         fontFamily: 'DM Sans, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                         filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                       }}>
                    SERVICES
                  </div>
                </Link>
                <Link href="/blog">
                  <div className="text-white/90 text-5xl xl:text-6xl font-light hover:text-white transition-all duration-300 cursor-pointer tracking-[0.2em]" 
                       style={{
                         fontFamily: 'DM Sans, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                         filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                       }}>
                    BLOG
                  </div>
                </Link>
                <Link href="/appointment">
                  <div className="text-white/90 text-5xl xl:text-6xl font-light hover:text-white transition-all duration-300 cursor-pointer tracking-[0.2em]" 
                       style={{
                         fontFamily: 'DM Sans, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                         filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                       }}>
                    APPOINTMENT
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer overlay - positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <Footer overlay={true} />
        </div>
      </section>
    </div>
  );
}

