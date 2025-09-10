import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  // No need for manual overflow control with new layout system

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "Book Appointment", href: "/appointment" },
  ];

  return (
    <div className="viewport-fit w-full">
      {/* Full Viewport Hero Section with Background Image */}
      <section className="relative viewport-content w-full">
        {/* Background Video */}
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            zIndex: 1
          }}
        >
          <source src="/banana.mp4" type="video/mp4" />
        </video>
        
        {/* Light overlay for better text readability while maintaining image clarity */}
        <div className="absolute inset-0 bg-black/25 sm:bg-black/15" />
        
        {/* Header overlay - positioned at top */}
        <div className="relative z-20 w-full">

          {/* Mobile burger menu (home-only, not header) */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 px-safe pt-safe">
            <div className="lg:hidden">
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
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>

        {/* Main title "nazdravi" positioned at bottom left corner */}
        <div className="absolute -bottom-16 left-8 z-10">
          <h1 className="text-7xl xs:text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem] font-light leading-tight text-white" 
              style={{
                fontFamily: 'The Seasons, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7), -1px -1px 3px rgba(255,255,255,0.25), 1px 1px 2px rgba(255,255,255,0.15)',
                filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.55))',
                letterSpacing: '-0.02em'
              }}>
            nazdravi
          </h1>
        </div>

        {/* Bottom right corner content */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-10 flex flex-col items-center">
          {/* Registered Dietitian text */}
          <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-wide mb-6 text-center"
             style={{
               fontFamily: 'Calibri, sans-serif',
               textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
               filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
             }}>
            REGISTERED DIETITIAN (UK and SA)
          </p>
          
          {/* BOOK APPOINTMENT button */}
          <Link href="/appointment">
             <Button 
               size="lg" 
               variant="outline"
               className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 lg:py-8 border-2 border-orange-400 text-white hover:bg-orange-500/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:border-orange-300 hover:scale-105 tap-target bg-gradient-to-r from-orange-500/80 to-red-500/80 hover:from-orange-500 hover:to-red-500"
               style={{fontFamily: 'Calibri, sans-serif', letterSpacing: '0.02em'}}
             >
               BOOK APPOINTMENT
             </Button>
          </Link>
        </div>

      </section>
    </div>
  );
}

