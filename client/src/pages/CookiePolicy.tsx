import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings, Shield, Mail } from "lucide-react";

export default function CookiePolicy() {

  return (
    <div className="h-full py-20 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Cookie className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground">
            How we use cookies and similar technologies
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                What Are Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit our website. They help us provide you with a better experience by remembering your 
                preferences, keeping you logged in, and analyzing how you use our services. We use cookies 
                and similar technologies to enhance your experience with Nazdravi services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Essential Cookies (Always Active)</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies are necessary for our website to function properly and cannot be disabled.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Session cookies to maintain your preferences during your visit</li>
                  <li>Load balancing cookies to ensure website performance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-blue-600">Functional Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies enhance your experience by remembering your choices and preferences.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Language preferences</li>
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Appointment booking preferences</li>
                  <li>Form data to prevent loss of information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-purple-600">Analytics Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies help us understand how visitors use our website so we can improve our services.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Google Analytics to understand website usage</li>
                  <li>Performance monitoring to identify technical issues</li>
                  <li>User behavior analysis to improve user experience</li>
                  <li>A/B testing to optimize our services</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Marketing Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies are used to deliver relevant advertisements and measure their effectiveness.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Social media integration cookies</li>
                  <li>Advertising network cookies</li>
                  <li>Retargeting cookies to show relevant content</li>
                  <li>Conversion tracking for marketing campaigns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Some cookies are placed by third-party services that appear on our pages. We use the 
                following third-party services that may set cookies:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Google Services</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google Analytics</li>
                    <li>• Google Fonts</li>
                    <li>• Google Firebase</li>
                    <li>• Google Authentication</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Communication Tools</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email service providers</li>
                    <li>• Chat and messaging services</li>
                    <li>• Video consultation platforms</li>
                    <li>• Appointment scheduling tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Browser Settings</h3>
                <p className="text-muted-foreground mb-3">
                  You can control and delete cookies through your browser settings. Please note that 
                  disabling certain cookies may affect the functionality of our website.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Chrome</h4>
                    <p className="text-muted-foreground">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Firefox</h4>
                    <p className="text-muted-foreground">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Safari</h4>
                    <p className="text-muted-foreground">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Edge</h4>
                    <p className="text-muted-foreground">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cookie Categories</h3>
                <p className="text-muted-foreground">
                  When you first visit our website, you'll see a cookie banner allowing you to choose 
                  which types of cookies to accept. You can change your preferences at any time by 
                  accessing the cookie settings in your browser or contacting us.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Cookie Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Session Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Deleted when you close your browser
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Short-term Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Expire within 24 hours to 30 days
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Long-term Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    May last up to 2 years for essential functions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Protection and GDPR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Under the General Data Protection Regulation (GDPR) and other privacy laws, you have 
                rights regarding cookies and personal data processing. We obtain your consent before 
                using non-essential cookies and provide clear information about our cookie usage. 
                You can withdraw your consent at any time without affecting the lawfulness of processing 
                based on consent before its withdrawal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Us About Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> cookies@nazdravi.com</p>
                <p><strong>Privacy Officer:</strong> privacy@nazdravi.com</p>
                <p><strong>Address:</strong> Nazdravi Practice</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or applicable laws. We will notify you of any material changes by posting the updated 
                policy on this page and updating the "last updated" date. We encourage you to review 
                this policy periodically to stay informed about our cookie practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}