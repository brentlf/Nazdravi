import { Link } from "wouter";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("services"), href: "/services" },
    { name: t("blog"), href: "/blog" },
    { name: t("resources"), href: "/resources" },
  ];

  const services = [
    { name: t("initial-consultation", "home"), href: "/services#initial" },
    { name: t("followup-sessions", "home"), href: "/services#followup" },
    { name: t("complete-program", "home"), href: "/services#program" },
    { name: t("meal-planning", "home"), href: "/services#meal-planning" },
    { name: t("progress-tracking", "home"), href: "/services#progress" },
  ];

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight">
                Nazdravi
              </span>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed text-base">
              {t("footer-description", "home")}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">
              {t("quick-links", "home")}
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">{t("services")}</h3>
            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">
              {t("contact", "home")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("email", "home")}
                  </p>
                  <a
                    href="mailto:info@nazdravi.com"
                    className="text-foreground hover:text-primary transition-colors duration-300"
                  >
                    info@nazdravi.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("phone", "home")}
                  </p>
                  <a
                    href="tel:+1234567890"
                    className="text-foreground hover:text-primary transition-colors duration-300"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("location", "home")}
                  </p>
                  <p className="text-foreground">
                    {t("address", "home")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Nazdravi. {t("all-rights-reserved", "home")}
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {t("privacy-policy", "home")}
              </Link>
              <Link
                href="/terms-of-service"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {t("terms-of-service", "home")}
              </Link>
              <Link
                href="/cookie-policy"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {t("cookie-policy", "home")}
              </Link>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              {t("made-with", "home")} <Heart className="h-4 w-4 text-red-500" /> {t("by", "home")} Nazdravi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
