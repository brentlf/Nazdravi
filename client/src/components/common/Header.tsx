import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "NAZDRAVI", href: "/" },
    { name: "ABOUT NAZDRAVI", href: "/about" },
    { name: "SERVICES", href: "/services" },
    { name: "BLOG", href: "/blog" },
    { name: "CONTACT", href: "/contact" },
    { name: "MY ACCOUNT", href: user ? "/dashboard" : "/login" },
  ];

  const isActive = (href: string) => location === href;
  const isHomePage = location === "/";
  const isAboutPage = location === "/about";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ease-out ${
      isHomePage || isAboutPage
        ? "bg-transparent border-none animate-fadeInDown" 
        : "bg-white border-b border-gray-200"
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28 w-full">
          {/* Desktop Navigation - Full Width with Equal Spacing */}
          <nav className="hidden md:flex items-center w-full">
            {navigation.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-5xl font-medium transition-all duration-700 ease-out transform hover:scale-105 ${
                  isHomePage
                    ? isActive(item.href)
                      ? "text-black"
                      : item.name === "MY ACCOUNT"
                      ? "text-orange-500 hover:text-orange-600"
                      : "text-black/80 hover:text-black"
                    : isAboutPage
                    ? isActive(item.href)
                      ? "text-white"
                      : item.name === "MY ACCOUNT"
                      ? "text-orange-400 hover:text-orange-300"
                      : "text-white/90 hover:text-white"
                    : isActive(item.href)
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  fontFamily: 'Calibri, sans-serif',
                  letterSpacing: '0.02em',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(0,0,0,0.3), 0px 0px 3px rgba(0,0,0,0.2)',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  animation: `slideInFromTop 0.8s ease-out ${index * 0.1}s both`,
                  opacity: 0
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden absolute right-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isHomePage 
                      ? "text-black hover:text-black/80" 
                      : isAboutPage
                      ? "text-white hover:text-white/80"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-lg font-medium text-gray-900">Menu</span>
                  </div>
                  
                  <nav className="flex-1 space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 text-lg font-medium transition-all duration-500 ease-out transform hover:scale-105 ${
                          isActive(item.href)
                            ? "text-gray-900 bg-gray-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        style={{
                          fontFamily: 'Calibri, sans-serif',
                          letterSpacing: '0.02em',
                          textShadow: '1px 1px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(0,0,0,0.3), 0px 0px 3px rgba(0,0,0,0.2)',
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="pt-6 border-t border-gray-200">
                    <ThemeToggle className="w-full justify-start" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}