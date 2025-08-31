import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, User, Calendar, Leaf, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
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

  // Show loading state if needed
  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('/OrangesBG.jpg')",
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

            {/* Requirements Status Section - COMPACT ONE LINE */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 mb-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-6">
                {/* Account Status */}
                <div className="flex items-center gap-2">
                  {user ? (
                    <div className="inline-flex items-center justify-center w-3 h-3 bg-green-500/20 rounded">
                      <CheckCircle className="w-1.5 h-1.5 text-green-400" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-3 h-3 bg-yellow-500/20 rounded">
                      <AlertTriangle className="w-1.5 h-1.5 text-yellow-400" />
                    </div>
                  )}
                  <span className="text-white font-medium text-xs">
                    {user ? "Account ✓" : "Account required"}
                  </span>
                  {!user && (
                    <Link href="/login">
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-xs font-medium h-5 px-2">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Consent Status */}
                <div className="flex items-center gap-2">
                  {hasConsent ? (
                    <div className="inline-flex items-center justify-center w-3 h-3 bg-green-500/20 rounded">
                      <CheckCircle className="w-1.5 h-1.5 text-green-400" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-3 h-3 bg-yellow-500/20 rounded">
                      <AlertTriangle className="w-1.5 h-1.5 text-yellow-400" />
                    </div>
                  )}
                  <span className="text-white font-medium text-xs">
                    {hasConsent ? "Consent ✓" : "Consent required"}
                  </span>
                  {!hasConsent && (
                    <Link href="/consent-form">
                      <Button variant="outline" size="sm" className="px-2 py-1 border-white/40 text-white hover:bg-white/20 text-xs font-semibold h-5">
                        Complete
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {user && hasConsent ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                  {/* Collapsible Header */}
                  <div 
                    className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <h2 className="text-sm font-bold text-white mb-2 leading-tight">Schedule Your Session</h2>
                        <p className="text-white/80 text-xs max-w-lg mx-auto mb-2 leading-none">
                          Fill out the form below and we'll get back to you within 24 hours
                        </p>
                        {!isFormExpanded && (
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs px-3 py-1 h-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFormExpanded(true);
                            }}
                          >
                            📝 Start Booking
                          </Button>
                        )}
                      </div>
                      <div className="ml-3">
                        {isFormExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/70" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Collapsible Form Content */}
                  {isFormExpanded && (
                    <div className="px-2 pt-0 pb-2">
                      <AppointmentForm />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-base font-bold text-white">Requirements Not Met</h2>
                  </div>
                  <p className="text-white/80 text-xs max-w-lg mx-auto">
                    Please complete the requirements above to schedule your appointment.
                  </p>
                </div>
              )}
            </div>

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
        </section>
      </div>
    </div>
  );
}
