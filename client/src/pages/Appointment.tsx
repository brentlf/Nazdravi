import { useState, useEffect } from "react";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Globe, AlertTriangle, CheckCircle, User, Calendar, ArrowRight, Leaf } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FloatingOrganic,
  DoodleConnector,
} from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Appointment() {
  const [hasConsent, setHasConsent] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  // Check if user has completed consent form from Firebase
  const { data: consentRecords } = useFirestoreCollection("consentRecords", [
    where("userId", "==", user?.uid || ""),
  ]);

  useEffect(() => {
    if (user?.uid && consentRecords) {
      // Check if any consent record has the required consents (based on your Firebase structure)
      const hasValidConsent = consentRecords.some(
        (record) =>
          record.languageConfirmation === true &&
          record.privateServiceConsent === true &&
          record.status === "completed",
      );
      setHasConsent(hasValidConsent);
    }
  }, [consentRecords, user?.uid]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Natural background with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e0e7ff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-8">
              <Calendar className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-foreground font-medium"
            >
              Professional Nutrition Counseling
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-balance text-foreground">
              Book Your Consultation
            </h1>
            
            <p className="text-xl lg:text-2xl mb-12 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Begin your personalized nutrition journey with expert guidance in English and Czech
            </p>
          </div>
        </div>
      </section>

      {/* Language Service Notice */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-primary/20 bg-primary/5 shadow-soft">
              <Globe className="h-5 w-5 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>Language Services:</strong> All consultations are conducted in English. Czech language support available upon request with advance notice.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Booking Requirements & Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Requirements Status Card */}
            <Card className="border-0 shadow-soft mb-12">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
                  <Shield className="w-6 h-6 text-primary" />
                  Booking Requirements
                </h3>

                <div className="space-y-4">
                  {/* Account Status */}
                  {user ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">
                            {t("account-verified", "appointment")}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0">
                        Complete
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-semibold text-amber-800 dark:text-amber-200">
                            Account Required
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Please sign in or create an account to book
                          </p>
                        </div>
                      </div>
                      <Link href="/login">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Consent Status */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/40">
                    <div className="flex items-center gap-3">
                      {hasConsent ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          Consent Form
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasConsent 
                            ? "You have completed the required consent forms" 
                            : "Please complete the consent form before booking"
                          }
                        </p>
                      </div>
                    </div>
                    {hasConsent ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0">
                        Complete
                      </Badge>
                    ) : (
                      <Link href="/consent-form">
                        <Button size="sm" variant="outline">
                          Complete Form
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Form */}
            {user && hasConsent ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4 text-foreground">
                    Schedule Your Session
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose your preferred date and time for your personalized nutrition consultation
                  </p>
                </div>
                
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-8">
                    <AppointmentForm />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-2xl mb-6">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Complete Requirements First
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Please ensure you have an account and have completed the consent form before booking your consultation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user && (
                    <Link href="/register">
                      <Button size="lg" className="px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                        Create Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  {!hasConsent && (
                    <Link href="/consent-form">
                      <Button variant="outline" size="lg" className="px-8 py-6">
                        Complete Consent Form
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
                What to Expect
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your consultation will be a comprehensive session designed to understand your unique needs and create a personalized plan.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Initial Assessment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We'll discuss your health history, current eating habits, and goals to understand your unique situation.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Leaf className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Personalized Plan</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive a customized nutrition strategy that fits your lifestyle, preferences, and health objectives.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Ongoing Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get continued guidance and adjustments to ensure you stay on track and achieve lasting results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Take the first step towards better nutrition and a healthier lifestyle today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && hasConsent ? (
                <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link href="/services">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
