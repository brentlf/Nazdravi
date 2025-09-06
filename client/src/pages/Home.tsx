import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings } from "lucide-react";
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
    <div className="min-h-screen">
      {/* Full Viewport Hero Section with Background Image */}
      <section className="relative h-screen w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-black/15" />
        
        {/* Header overlay - positioned at top */}
        <div className="relative z-20 w-full">
          {/* Top left logo and account section */}
          <div className="absolute top-6 left-8 flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/40 rounded-md"></div>
            </div>
            
            {/* Account section with dropdown for logged-in users */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span 
                    className="text-white text-lg font-light tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
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
                className="text-white text-lg font-light tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                style={{fontFamily: 'Calibri, sans-serif'}}
                onClick={() => setLocation("/login")}
              >
                sign in
              </span>
            )}
          </div>
        </div>

        {/* Main content with navigation on the right */}
        <div className="relative z-10 h-full flex items-end pb-20">
          <div className="w-full pl-8 pr-6">
            <div className="flex items-end justify-between h-full w-full">
              {/* Left side - Main content positioned at bottom left */}
              <div className="max-w-4xl -ml-4">
                {/* Main title "nazdravi" raised from the image */}
                <h1 className="text-8xl sm:text-9xl lg:text-[12rem] xl:text-[14rem] font-extralight mb-2 leading-tight text-white" 
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.8), -2px -2px 4px rgba(255,255,255,0.3), 1px 1px 2px rgba(255,255,255,0.2)',
                      filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.6))'
                    }}>
                  nazdravi
                </h1>
                
                {/* Centered content under nazdravi */}
                <div className="flex flex-col items-center">
                  {/* Subtitle "REGISTERED DIETITIAN" centered under nazdravi - larger font */}
                  <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-10 text-white font-light tracking-wide opacity-90 text-center"
                     style={{fontFamily: 'DM Sans, sans-serif'}}>
                    REGISTERED DIETITIAN
                  </p>
                  
                  {/* BOOK AN APPOINTMENT button centered - larger */}
                  <Link href="/appointment">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-xl sm:text-2xl px-8 sm:px-12 py-6 sm:py-8 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:border-white/60 hover:scale-105"
                      style={{fontFamily: 'DM Sans, sans-serif'}}
                    >
                      BOOK AN APPOINTMENT
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right lower corner - Navigation menu with elegant styling */}
              <div className="hidden lg:flex flex-col items-end space-y-6 absolute bottom-12 right-12">
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

