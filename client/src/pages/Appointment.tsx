import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, User, Calendar, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default function Appointment() {
  const { user } = useAuth();
  const [hasConsent, setHasConsent] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  
  // Check if user has completed consent form from Firebase
  const { data: consentRecords, loading } = useFirestoreCollection("consentRecords", [
    where("userId", "==", user?.uid || ""),
  ], { enabled: !!user?.uid });

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

  // Show loading state if needed
  if (loading && user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Main content section */}
      <section className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header Section */}
          <div className="text-center mb-4 xs:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-3 xs:mb-4 shadow-lg">
              <Calendar className="h-6 w-6 xs:h-7 xs:w-7 text-primary" />
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-2 xs:mb-3 leading-tight text-foreground font-serif">
              Book Consultation
            </h1>
            <p className="text-base xs:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Begin your personalized nutrition journey with expert guidance in English and Czech.
            </p>
          </div>

          {/* Requirements Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 mb-4 xs:mb-6">
            {/* Account Status Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-muted/30 border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-3 xs:p-4">
                <div className="flex items-center gap-3 xs:gap-4">
                  {user ? (
                    <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-sm">
                      <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-sm">
                      <User className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base xs:text-lg font-semibold mb-1 text-card-foreground">
                      {user ? "Account Verified ✓" : "Let's Get Started!"}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs xs:text-sm">
                      {user ? "You're signed in and ready to book" : "Create your account to begin your nutrition journey"}
                    </p>
                    {!user && (
                      <Link href="/login">
                        <Button size="sm" className="mt-2 xs:mt-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-sky-300/30 px-3 xs:px-4 py-1.5 font-semibold text-xs xs:text-sm">
                          <User className="w-3 h-3 xs:w-4 xs:h-4 mr-2" />
                          Join Us Today
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Status Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-muted/30 border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-3 xs:p-4">
                <div className="flex items-center gap-3 xs:gap-4">
                  {hasConsent ? (
                    <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-sm">
                      <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm">
                      <Shield className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base xs:text-lg font-semibold mb-1 text-card-foreground">
                      {hasConsent ? "Consent Completed ✓" : "Almost There!"}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs xs:text-sm">
                      {hasConsent ? "All legal requirements are met" : "Just a quick form to ensure we can help you safely"}
                    </p>
                    {!hasConsent && (
                      <Link href="/consent-form">
                        <Button size="sm" className="mt-2 xs:mt-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-cyan-300/30 px-3 xs:px-4 py-1.5 font-semibold text-xs xs:text-sm">
                          <Shield className="w-3 h-3 xs:w-4 xs:h-4 mr-2" />
                          Complete Form
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Section */}
          {user && hasConsent ? (
            <div className="bg-gradient-to-br from-card via-card/95 to-primary/5 border border-primary/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Collapsible Header */}
              <div 
                className="p-4 xs:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 border-b border-primary/10"
                onClick={() => setIsFormExpanded(!isFormExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl mb-3 xs:mb-4 shadow-lg">
                      <Calendar className="h-6 w-6 xs:h-7 xs:w-7 text-white" />
                    </div>
                    <h2 className="text-xl xs:text-2xl font-bold text-card-foreground mb-2 xs:mb-3">Schedule Your Session</h2>
                    <p className="text-muted-foreground mb-4 xs:mb-6 text-base xs:text-lg">
                      Fill out the form below and we'll get back to you within 24 hours
                    </p>
                    {!isFormExpanded && (
                      <div className="relative">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFormExpanded(true);
                          }}
                          className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-sky-300/30 px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-xl"
                        >
                          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                          📝 Start Booking
                        </Button>
                        {/* Subtle pulsing ring */}
                        <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-20"></div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 xs:ml-6">
                    {isFormExpanded ? (
                      <ChevronUp className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Collapsible Form Content */}
              {isFormExpanded && (
                <div className="p-4 xs:p-6">
                  <AppointmentForm />
                </div>
              )}
            </div>
          ) : (
            <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-orange-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-sm">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg xs:text-xl font-bold text-orange-800">Ready to Begin Your Journey?</CardTitle>
                </div>
                <p className="text-orange-700 max-w-lg mx-auto mb-4 text-sm xs:text-base">
                  We're excited to help you on your nutrition journey! Just complete the steps above and you'll be ready to book your consultation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {!user && (
                    <Link href="/login">
                      <Button className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-sky-300/30 px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-xl">
                        <User className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                  )}
                  {user && !hasConsent && (
                    <Link href="/consent-form">
                      <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-cyan-300/30 px-6 xs:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-xl">
                        <Shield className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                        Complete Form
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information Section */}
          <div className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg xs:text-xl font-bold text-card-foreground text-center mb-4">What to Expect</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-3">
                    <User className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <h4 className="text-card-foreground font-semibold text-base xs:text-lg mb-2">Personalized Assessment</h4>
                  <p className="text-muted-foreground text-sm xs:text-base">Comprehensive evaluation of your current nutrition and health goals</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-3">
                    <Leaf className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <h4 className="text-card-foreground font-semibold text-base xs:text-lg mb-2">Customized Plan</h4>
                  <p className="text-muted-foreground text-sm xs:text-base">Tailored nutrition strategies that fit your lifestyle and preferences</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-3">
                    <Shield className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <h4 className="text-card-foreground font-semibold text-base xs:text-lg mb-2">Ongoing Support</h4>
                  <p className="text-muted-foreground text-sm xs:text-base">Continuous guidance and adjustments as you progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}