import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default function Appointment() {
  return (
    <div className="min-h-screen py-20 bg-primary-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Book Your Consultation
          </h1>
          <p className="text-xl text-muted-foreground">
            Start your nutrition journey with a personalized consultation
          </p>
        </div>

        {/* Appointment Form */}
        <div className="max-w-4xl mx-auto">
          <AppointmentForm />
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
