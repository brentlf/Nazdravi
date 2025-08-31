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
    <div className="min-h-screen bg-background relative">
      {/* Background Image - Full Screen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(/OrangesBG.jpg)`,
        }}
      />
      {/* Dark overlay - Full Screen */}
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Content Container - Full height with proper spacing for footer overlay */}
      <div className="min-h-screen pt-16 pb-20">
        {/* Main content section */}
        <section className="flex flex-col justify-center px-4 h-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-3 flex-shrink-0">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full mb-2">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight text-white font-serif">
                Book Consultation
              </h1>
              <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto leading-relaxed">
                Begin your personalized nutrition journey with expert guidance in English and Czech.
              </p>
            </div>

            {/* Requirements Status Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 mb-3 flex-shrink-0">
              <h2 className="text-base font-bold text-white text-center mb-2">Requirements Checklist</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {/* Account Status */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 border border-white/25">
                  <div className="flex items-center gap-2 mb-1">
                    {user ? (
                      <div className="inline-flex items-center justify-center w-5 h-5 bg-green-500/20 rounded-lg">
                        <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-5 h-5 bg-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-2.5 h-2.5 text-yellow-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-xs">Account Status</h3>
                      <p className="text-white/70 text-xs">
                        {user ? "Verified and ready" : "Account required to proceed"}
                      </p>
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="bg-green-500/10 rounded-lg p-1 border border-green-500/20">
                      <p className="text-green-300 text-xs font-medium">{user.email}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-white/60 text-xs">Please sign in to book your consultation</p>
                      <Link href="/login">
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-xs font-medium h-5 px-2">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Consent Status */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 border border-white/25">
                  <div className="flex items-center gap-2 mb-1">
                    {hasConsent ? (
                      <div className="inline-flex items-center justify-center w-5 h-5 bg-green-500/20 rounded-lg">
                        <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-5 h-5 bg-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-2.5 h-2.5 text-yellow-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-xs">Consent Form</h3>
                      <p className="text-white/70 text-xs">
                        {hasConsent ? "Completed successfully" : "Required before booking"}
                      </p>
                    </div>
                  </div>
                  
                  {hasConsent ? (
                    <div className="bg-green-500/10 rounded-lg p-1 border border-green-500/20">
                      <p className="text-green-300 text-xs font-medium">All consents confirmed</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-white/60 text-xs">Complete the consent form to proceed</p>
                      <Link href="/consent-form">
                        <Button variant="outline" size="sm" className="px-2 py-1 border-white/40 text-white hover:bg-white/20 text-xs font-semibold">
                          Complete Form
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {user && hasConsent ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <div className="text-center mb-3">
                    <h2 className="text-base font-bold text-white mb-2">Schedule Your Session</h2>
                    <p className="text-white/80 text-xs max-w-lg mx-auto">
                      Choose your preferred date and time for a personalized nutrition consultation. 
                      Our team will work with you to find the perfect slot that fits your schedule.
                    </p>
                  </div>
                  <AppointmentForm />
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-white/15 rounded-full mb-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Complete Requirements First</h3>
                  <p className="text-white/70 mb-3 text-xs max-w-lg mx-auto">
                    To ensure a smooth booking experience, please complete the account setup and consent form requirements before scheduling your consultation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {!user && (
                      <Link href="/register">
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 px-2 py-1 text-xs font-semibold">
                          Create Account
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                    {!hasConsent && (
                      <Link href="/consent-form">
                        <Button variant="outline" size="sm" className="px-2 py-1 border-white/40 text-white hover:bg-white/20 text-xs font-semibold">
                          Complete Consent Form
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              <div className="mt-3 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <h3 className="text-sm font-bold text-white mb-2">What to Expect</h3>
                  <div className="grid md:grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mb-1">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <h4 className="text-white font-semibold text-xs mb-1">Personalized Assessment</h4>
                      <p className="text-white/70 text-xs">Comprehensive evaluation of your current nutrition and health goals</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mb-1">
                        <Leaf className="h-3 w-3 text-white" />
                      </div>
                      <h4 className="text-white font-semibold text-xs mb-1">Customized Plan</h4>
                      <p className="text-white/70 text-xs">Tailored nutrition strategies that fit your lifestyle and preferences</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-1">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                      <h4 className="text-white font-semibold text-xs mb-1">Ongoing Support</h4>
                      <p className="text-white/70 text-xs">Continuous guidance and adjustments as you progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
