import { useState, useEffect } from "react";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Globe, AlertTriangle, CheckCircle, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Appointment() {
  const [hasConsent, setHasConsent] = useState(false);
  const { user } = useAuth();

  // Check if user has completed consent form
  useEffect(() => {
    const consentCompleted = localStorage.getItem('consentFormCompleted');
    setHasConsent(consentCompleted === 'true');
  }, []);

  return (
    <div className="min-h-screen py-20 bg-primary-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Book Your Consultation
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional nutrition consultations provided in <strong>English (primary)</strong> and <strong>Czech (upon request)</strong>
          </p>
        </div>

        {/* Language Service Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Globe className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Language Services:</strong> Care is provided exclusively in <strong>English (primary)</strong> and 
                <strong> Czech (upon request)</strong> to ensure comprehensive understanding for patient safety and treatment effectiveness.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Booking Requirements & Form */}
        <div className="max-w-4xl mx-auto">
          {/* Requirements Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Booking Requirements
            </h3>
            
            <div className="space-y-3">
              {/* Account Status */}
              {user ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">Account Verified</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">Signed in as {user.name}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded">
                    Complete
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Account Required</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-300">Create an account to manage your appointments</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Consent Status */}
              {user && (
                hasConsent ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">Informed Consent</h4>
                        <p className="text-sm text-green-600 dark:text-green-300">Consent form completed and recorded</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded">
                      Complete
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">Informed Consent Required</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-300">Complete the informed consent form to enable booking</p>
                      </div>
                    </div>
                    <Link href="/consent-form">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                        Complete Form
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
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ready to Book</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">All requirements completed</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <AlertTriangle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-600 dark:text-gray-400">Complete Requirements Above</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking will be enabled once all steps are completed</p>
              </div>
            )}
          </div>

          {/* Appointment Form */}
          {user && hasConsent ? (
            <AppointmentForm />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Appointment Booking Form
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Complete the requirements above to access the booking form
              </p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* What to Expect */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>Comprehensive health and lifestyle assessment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>Discussion of your nutrition goals and challenges</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>Initial recommendations and next steps</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <span>Access to your personal client dashboard</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Questions?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions or need assistance with booking, feel free to contact us directly.
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
    </div>
  );
}
