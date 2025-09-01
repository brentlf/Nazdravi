import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Leaf, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "Book Appointment", href: "/appointment" },
  ];

  const isActive = (href: string) => location === href;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const overlayHeaderRoutes = ["/", "/about", "/services", "/blog", "/appointment"];
  const isOverlayHeader = overlayHeaderRoutes.includes(location);

  return (
    <header className={`${
      isOverlayHeader 
        ? "absolute top-0 left-0 right-0 z-50 border-white/20 bg-transparent text-white" 
        : "sticky top-0 z-50 border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 text-foreground"
    } w-full border-b transition-all duration-300`}>
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
              isOverlayHeader ? "bg-white/20 backdrop-blur-sm" : "bg-primary"
            }`}>
              <Leaf className={`h-6 w-6 ${
                isOverlayHeader ? "text-white" : "text-primary-foreground"
              }`} />
            </div>
            <span className={`font-bold text-xl tracking-tight ${
              isOverlayHeader ? "text-white" : "text-primary"
            }`}>
              Nazdravi
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-10">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition-all duration-300 ${
                isOverlayHeader
                  ? isActive(item.href)
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                  : isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
              {isActive(item.href) && (
                <span className={`absolute -bottom-2 left-0 w-full h-0.5 rounded-full ${
                  isOverlayHeader ? "bg-white" : "bg-primary"
                }`}></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* User menu or auth buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-10 w-10 rounded-full hover:bg-muted/80 ${
                  isOverlayHeader ? "text-white hover:bg-white/20" : ""
                }`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className={`font-semibold ${
                      isOverlayHeader ? "bg-white/20 text-white" : "bg-primary text-primary-foreground"
                    }`}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 p-2" 
                align="end" 
                forceMount
                style={{
                  backgroundColor: 'hsl(var(--popover))',
                  color: 'hsl(var(--popover-foreground))',
                  borderColor: 'hsl(var(--border))',
                  opacity: 1,
                  backdropFilter: 'none'
                }}
              >
                <div className="flex items-center justify-start gap-3 p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/80">
                        <User className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/80">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/80 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className={`font-medium ${
                  isOverlayHeader 
                    ? "text-white hover:bg-white/20" 
                    : "hover:bg-muted/80"
                }`}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className={`font-medium shadow-soft hover:shadow-elegant transition-all duration-300 ${
                  isOverlayHeader 
                    ? "bg-white/20 text-white hover:bg-white/30 border-white/30" 
                    : ""
                }`}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden h-10 w-10 ${
                  isOverlayHeader ? "text-white hover:bg-white/20" : ""
                }`}
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg text-primary">Nazdravi</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <nav className="flex-1 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {!user && (
                  <div className="pt-6 border-t border-border/40 space-y-3">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center shadow-soft">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
