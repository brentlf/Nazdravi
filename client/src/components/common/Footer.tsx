import { Link } from "wouter";
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
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
    { name: "Initial Consultation", href: "/services#initial" },
    { name: "Follow-up Sessions", href: "/services#followup" },
    { name: "Complete Program", href: "/services#program" },
    { name: "Meal Planning", href: "/services#meal-planning" },
    { name: "Progress Tracking", href: "/services#progress" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary-400">Vee Nutrition</span>
            </div>
            <p className="text-gray-300 mb-6">
              Transform your health with personalized nutrition guidance and sustainable lifestyle changes.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-gray-800 hover:bg-gray-700">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-gray-800 hover:bg-gray-700">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-gray-800 hover:bg-gray-700">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6">{t("services")}</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">{t("contact")}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">info@vee-nutrition.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">+31 6 12345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">Amsterdam, Netherlands</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Vee Nutrition. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
