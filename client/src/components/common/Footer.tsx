import { Link } from "wouter";
import { Heart, Mail, Phone } from "lucide-react";

interface FooterProps {
  overlay?: boolean;
}

export function Footer({ overlay = false }: FooterProps) {
  return (
    <footer className={`w-full transition-all duration-300 footer-responsive ${
      overlay 
        ? "bg-black/60 backdrop-blur-sm text-white border-white/20" 
        : "bg-background text-foreground border-border/40"
    } border-t flex-shrink-0`}>
      <div className="responsive-container py-2 sm:py-3 pb-safe">
        {/* Single minimalistic row with logo, contact, and essential links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Logo and branding */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center ${
              overlay ? "bg-white/20" : "bg-primary"
            }`}>
              <span className={`text-xs font-bold ${
                overlay ? "text-white" : "text-primary-foreground"
              }`}>
                N
              </span>
            </div>
            <span className={`font-semibold text-xs sm:text-sm ${
              overlay ? "text-white" : "text-primary"
            }`}>
              Nazdravi
            </span>
          </div>

          {/* Essential links */}
          <div className="hidden sm:flex items-center space-x-4 md:space-x-6">
            <Link href="/privacy" className={`text-xs sm:text-sm hover:opacity-80 transition-opacity ${
              overlay ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
            }`}>
              Privacy
            </Link>
            <Link href="/terms" className={`text-xs sm:text-sm hover:opacity-80 transition-opacity ${
              overlay ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
            }`}>
              Terms
            </Link>
            <Link href="/contact" className={`text-xs sm:text-sm hover:opacity-80 transition-opacity ${
              overlay ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
            }`}>
              Contact
            </Link>
          </div>

          {/* Contact info and copyright */}
          <div className="hidden sm:flex items-center space-x-3 md:space-x-4">
            {/* Contact info */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="flex items-center gap-1">
                <Mail className={`h-3 w-3 ${
                  overlay ? "text-white/60" : "text-muted-foreground"
                }`} />
                <span className={`text-xs hidden md:inline ${
                  overlay ? "text-white/70" : "text-muted-foreground"
                }`}>
                  info@nazdravi.com
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className={`h-3 w-3 ${
                  overlay ? "text-white/60" : "text-muted-foreground"
                }`} />
                <span className={`text-xs hidden md:inline ${
                  overlay ? "text-white/70" : "text-muted-foreground"
                }`}>
                  +420 123 456 789
                </span>
              </div>
            </div>

            {/* Copyright */}
            <div className={`flex items-center gap-1 text-xs ${
              overlay ? "text-white/70" : "text-muted-foreground"
            }`}>
              <span>© 2024</span>
              <Heart className="h-2.5 w-2.5 fill-current" />
            </div>
          </div>
          {/* Mobile-only condensed copyright */}
          <div className={`sm:hidden mt-1 text-xs ${overlay ? "text-white/70" : "text-muted-foreground"}`}>
            © 2024
          </div>
        </div>
      </div>
    </footer>
  );
}
