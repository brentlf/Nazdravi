import { useState, useEffect } from "react";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Appointment() {
  const [hasConsent, setHasConsent] = useState(false);

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

        {/* Compliance Notice - Required Consent */}
        <div className="max-w-4xl mx-auto mb-8">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  ⚠️ Required: Complete Informed Consent Before Booking
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  All clients must complete our informed consent process before booking appointments. 
                  This ensures compliance with healthcare regulations and confirms language comprehension for safe care delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/consent-form">
                    <Button className="bg-[#A5CBA4] hover:bg-[#95bb94] text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Complete Required Consent Form
                    </Button>
                  </Link>
                  <Link href="/legal">
                    <Button variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50">
                      <Globe className="w-4 h-4 mr-2" />
                      View Legal Information
                    </Button>
                  </Link>
                </div>
              </div>
            </AlertDescription>
          </Alert>
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

        {/* Appointment Form - Only if consent completed */}
        <div className="max-w-4xl mx-auto">
          {!hasConsent ? (
            <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 text-center">
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Booking Blocked - Consent Required
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                You must complete the informed consent form before booking appointments.
              </p>
              <Link href="/consent-form">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Complete Consent Form First
                </Button>
              </Link>
            </div>
          ) : (
            <AppointmentForm />
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
