import { useState, useEffect } from "react";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Globe, AlertTriangle, CheckCircle, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";
import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/badge";

export default function Appointment() {
  const [hasConsent, setHasConsent] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  // Check if user has completed consent form from Firebase
  const { data: consentRecords } = useFirestoreCollection("consentRecords", [
    where("userId", "==", user?.uid || "")
  ]);

  useEffect(() => {
    if (user?.uid && consentRecords) {
      // Check if any consent record has the required consents (based on your Firebase structure)
      const hasValidConsent = consentRecords.some(record => 
        record.languageConfirmation === true && 
        record.privateServiceConsent === true &&
        record.status === "completed"
      );
      setHasConsent(hasValidConsent);
    }
  }, [consentRecords, user?.uid]);

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-background to-muted/30 country-texture relative overflow-hidden page-content">
      <div className="container mx-auto px-4 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12 relative">
          <Badge variant="secondary" className="mb-4 text-base px-4 py-2 floating-element">
            Professional Nutrition Counseling
          </Badge>
          <div className="doodle-arrow mb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4 handwritten-accent">
              Book Your Consultation
            </h1>
          </div>
          <p className="serif-body text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Begin your personalized nutrition journey with expert guidance in English and Czech
          </p>
          
          {/* Connecting doodle */}
          <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
        </div>

        {/* Language Service Notice */}
        <div className="max-w-4xl mx-auto mb-8 relative">
          <Alert className="mediterranean-card border-primary/20 bg-primary/5 floating-element">
            <Globe className="h-4 w-4 text-primary" />
            <AlertDescription>
              <p className="serif-body text-sm text-foreground">
                <strong>Language Services:</strong> All consultations are conducted in English. Czech language support available upon request with advance notice.
              </p>
            </AlertDescription>
          </Alert>
          
          <FloatingOrganic className="absolute -top-4 -right-4 opacity-20" size="small" delay={1} />
        </div>

        {/* Booking Requirements & Form */}
        <div className="max-w-4xl mx-auto">
          {/* Requirements Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Booking Requirements
            </h3>
            
            <div className="space-y-2">
              {/* Account Status */}
              {user ? (
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200 text-sm">{t("account-verified", "appointment")}</p>
                      <p className="text-xs text-green-600 dark:text-green-300">{t("signed-in-as", "appointment")} {user.name}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded">
                    {t("complete", "appointment")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">{t("account-required", "appointment")}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">{t("create-account", "appointment")}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1">
                        {t("sign-in", "appointment")}
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1">
                        {t("register", "appointment")}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Consent Status */}
              {user && (
                hasConsent ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200 text-sm">{t("informed-consent", "appointment")}</p>
                        <p className="text-xs text-green-600 dark:text-green-300">{t("consent-completed", "appointment")}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded">
                      {t("complete", "appointment")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">{t("informed-consent-required", "appointment")}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-300">{t("complete-consent", "appointment")}</p>
                      </div>
                    </div>
                    <Link href="/consent-form">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1">
                        {t("complete-form", "appointment")}
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Overall Status */}
            {user && hasConsent ? (
              <div className="mt-4 p-4 bg-[#A5CBA4]/10 rounded-lg border border-[#A5CBA4]/30 text-center">
                <CheckCircle className="w-6 h-6 text-[#A5CBA4] mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t("ready-to-book", "appointment")}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("all-requirements-completed", "appointment")}</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <AlertTriangle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-600 dark:text-gray-400">{t("complete-requirements", "appointment")}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("booking-enabled", "appointment")}</p>
              </div>
            )}
          </div>

          {/* Appointment Form */}
          {user && hasConsent ? (
            <AppointmentForm />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t("appointment-booking-form", "appointment")}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {t("complete-requirements-access", "appointment")}
              </p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* What to Expect */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">{t("what-to-expect", "appointment")}</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>{t("health-assessment", "appointment")}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>{t("nutrition-goals", "appointment")}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>{t("initial-recommendations", "appointment")}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>{t("client-dashboard", "appointment")}</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">{t("questions", "appointment")}</h3>
              <p className="text-muted-foreground mb-6">
                {t("questions-description", "appointment")}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400">📧</span>
                  </div>
                  <span>info@vee-nutrition.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400">📞</span>
                  </div>
                  <span>+31 6 12345678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400">📍</span>
                  </div>
                  <span>Amsterdam, Netherlands</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={2} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={4} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={1} />
      <FloatingOrganic className="absolute bottom-1/3 left-10 opacity-10" size="medium" delay={3} />
    </div>
  );
}
