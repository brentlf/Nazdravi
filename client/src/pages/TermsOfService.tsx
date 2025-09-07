import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, Mail } from "lucide-react";

export default function TermsOfService() {

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using our services
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using Nazdravi services, you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to these terms, you should 
                not use our services. These terms apply to all visitors, users, and others who access 
                or use our nutrition consultation services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description of Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nazdravi provides professional nutrition consultation services, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Individual nutrition consultations and assessments</li>
                <li>Personalized meal planning and dietary recommendations</li>
                <li>Health and wellness guidance</li>
                <li>Educational resources and materials</li>
                <li>Progress tracking and follow-up consultations</li>
                <li>Online appointment booking and messaging services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Medical Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Important:</strong> The information and services provided by Nazdravi are for 
                educational and informational purposes only and are not intended as medical advice, diagnosis, 
                or treatment.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Always consult with your physician or healthcare provider before making dietary changes</li>
                <li>Our services do not replace professional medical care or treatment</li>
                <li>We are not responsible for any adverse effects from following our recommendations</li>
                <li>Individual results may vary and are not guaranteed</li>
                <li>If you have a medical condition, please consult your doctor before starting any nutrition program</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By using our services, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information about your health and dietary needs</li>
                <li>Follow appointment policies and provide adequate notice for cancellations</li>
                <li>Respect our practitioners and staff</li>
                <li>Use our services only for lawful purposes</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us of any changes to your health status or medical conditions</li>
                <li>Take responsibility for implementing dietary recommendations safely</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Appointment Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Booking and Confirmation</h3>
                <p className="text-muted-foreground">
                  Appointments must be booked through our online system. All appointments are subject to 
                  confirmation by our team. You will receive a confirmation email with appointment details.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                <p className="text-muted-foreground">
                  Appointments must be cancelled at least 24 hours in advance. Late cancellations or 
                  no-shows may be subject to fees. We understand emergencies happen and will work with 
                  you on a case-by-case basis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Missed Appointments</h3>
                <p className="text-muted-foreground">
                  If you miss an appointment without prior notice, you may be charged for the session. 
                  Repeated no-shows may result in restrictions on future bookings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Payment is due at the time of service unless other arrangements are made</li>
                <li>We accept various payment methods as displayed during booking</li>
                <li>All fees are non-refundable unless otherwise specified</li>
                <li>Prices are subject to change with reasonable notice</li>
                <li>You are responsible for any fees imposed by your financial institution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All content provided through our services, including meal plans, educational materials, 
                and recommendations, remains the intellectual property of Nazdravi. You may use 
                this content for personal purposes only and may not redistribute, sell, or modify it 
                without our express written permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, Nazdravi shall not be liable for any 
                indirect, incidental, special, or consequential damages arising from your use of our 
                services. Our total liability shall not exceed the amount paid by you for the specific 
                service giving rise to the claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Privacy and Confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are committed to protecting your privacy and maintaining the confidentiality of your 
                health information. Please refer to our Privacy Policy for detailed information about 
                how we collect, use, and protect your personal information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your access to our services at any time, 
                with or without notice, for any reason including violation of these terms. You may 
                also terminate your use of our services at any time by contacting us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> terms@nazdravi.com</p>
                <p><strong>Address:</strong> Nazdravi Practice</p>
                <p><strong>Phone:</strong> Available through our contact form</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes by posting the updated terms on this page and updating the "last updated" 
                date. Your continued use of our services after such changes constitutes acceptance of 
                the new terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}