import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Scale, Globe, FileText, AlertCircle } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Legal Information
          </h1>
          <p className="text-lg text-muted-foreground">
            Important legal information for Nazdravi clients
          </p>
        </div>

        {/* Language Notice */}
        <Alert className="mb-8 border-brand/30 bg-success/10 dark:bg-success/15">
          <Globe className="h-4 w-4 text-brand" />
          <AlertDescription className="text-sm">
            <strong>Language Services:</strong> Our nutrition consultations are provided exclusively in English (primary) and Czech (upon request). 
            We confirm that care can only be provided in languages where comprehensive understanding is ensured for patient safety and treatment effectiveness.
          </AlertDescription>
        </Alert>

        <div className="grid gap-8">
          {/* Practice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" />
                Practice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Professional Registration</h3>
                <div className="text-sm space-y-1">
                  <p><strong>HCPC Registration (UK):</strong> [HCPC_NUMBER] - Health and Care Professions Council</p>
                  <p><strong>HPCSA Registration (South Africa):</strong> [HPCSA_NUMBER] - Health Professions Council of South Africa</p>
                  <p><strong>Dutch Practice:</strong> Notified under the Dutch Wtza (Healthcare Quality, Complaints and Disputes Act)</p>
                  <p><strong>BIG Register:</strong> The protected Dutch title 'diëtist' falls under Article 34 Wet BIG. As a qualified practitioner with recognized EU qualifications, BIG register entry is not required.</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Practice Details</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Practice Name:</strong> Nazdravi</p>
                  <p><strong>Address:</strong> [PRACTICE_ADDRESS], Netherlands</p>
                  <p><strong>KvK Number:</strong> [KVK_NUMBER]</p>
                  <p><strong>VAT Status:</strong> Healthcare services are VAT-exempt in the Netherlands. VAT at 21% may apply to non-care products.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" />
                Service Scope & Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Geographic Eligibility</h3>
                <p className="text-sm">
                  Services are available to residents of the United Kingdom, South Africa, Czech Republic, and Netherlands expatriates. 
                  Consultations are provided exclusively to English or Czech speakers to ensure comprehensive understanding and patient safety.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Cross-Border Recognition</h3>
                <div className="text-sm space-y-2">
                  <p><strong>Czech Republic:</strong> Services provided under § 36a of Act No. 18/2004 Coll. on a temporary and occasional basis with recognized professional qualifications.</p>
                  <p><strong>UK:</strong> HCPC registration ensures professional standards compliance.</p>
                  <p><strong>South Africa:</strong> HPCSA registration with adherence to Booklet 10 guidelines for telehealth services.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <strong>Emergency Services:</strong> This service does not provide emergency care. 
                  In case of medical emergency, contact your local emergency number immediately.
                </AlertDescription>
              </Alert>
              
              <div>
                <h3 className="font-semibold mb-2">Medical Disclaimer</h3>
                <p className="text-sm">
                  Nutrition consultations provide general lifestyle and medical nutrition advice. No invasive procedures are performed. 
                  Results may vary by individual. No specific weight-loss amounts or outcomes are guaranteed. 
                  This service provides support but does not replace regular medical care with your physician.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Private Service Notice</h3>
                <p className="text-sm">
                  This is a private healthcare service. Payment from public health insurance systems is not available. 
                  For South African clients: Local follow-up with a physician may be required as per HPCSA Booklet 10 guidelines.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Complaints & Disputes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand" />
                Complaints & Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How to Make a Complaint</h3>
                <p className="text-sm mb-2">
                  If you have concerns about our service, please contact our complaints officer:
                </p>
                <p className="text-sm font-medium">
                  Email: <a href="mailto:[COMPLAINTS_EMAIL]" className="text-link hover:underline">[COMPLAINTS_EMAIL]</a>
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">External Dispute Resolution</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Netherlands:</strong> Dutch Healthcare Disputes Committee - <a href="[DISPUTES_COMMITTEE_URL]" className="text-link hover:underline">[DISPUTES_COMMITTEE_URL]</a></p>
                  <p><strong>Czech Clients:</strong> Czech Trade Inspection Authority (ČOI) for consumer disputes</p>
                  <p><strong>Final Resolution:</strong> Dutch courts have jurisdiction for legal disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Czech Language Summary Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🇨🇿 Czech Language Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                For Czech-speaking clients, a comprehensive summary of legal information is available in Czech language.
              </p>
              <a 
                href="/legal/czech-summary" 
                className="inline-flex items-center text-link hover:underline font-medium"
              >
                View Czech Legal Summary (Právní souhrn v češtině) →
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 Nazdravi. All rights reserved.</p>
          <p className="mt-2">
            For complete terms and conditions, privacy policy, and detailed legal information, 
            please see our <a href="/terms" className="text-link hover:underline">Terms & Conditions</a> and 
            <a href="/privacy" className="text-link hover:underline ml-1">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}