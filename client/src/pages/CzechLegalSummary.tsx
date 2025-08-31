import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CzechLegalSummary() {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/legal">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Legal Information
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            🇨🇿 Právní souhrn
          </h1>
          <p className="text-lg text-muted-foreground">
            Shrnutí právních informací pro české klienty
          </p>
        </div>

        <div className="grid gap-8">
          {/* Main Legal Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#A5CBA4]" />
                Právní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h3 className="font-semibold mb-3">Poskytování služeb v České republice</h3>
                <p className="text-sm leading-relaxed">
                  Služby klinické výživy jsou poskytovány <strong>na dočasném a příležitostném základě</strong> 
                  dle § 36a zákona č. 18/2004 Sb., o uznávání odborné kvalifikace. Dietolog má uznanou 
                  odbornou kvalifikaci získanou ve Spojeném království (HCPC registrace) a Jihoafrické republice (HPCSA registrace).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Soukromá služba</h3>
                <p className="text-sm leading-relaxed">
                  Jedná se o <strong>soukromou zdravotní službu</strong>. Úhrada z veřejného zdravotního pojištění 
                  není možná. Konzultace jsou poskytovány výhradně v anglickém jazyce (primárně) nebo českém jazyce (na požádání) 
                  pro zajištění úplného porozumění a bezpečnosti pacienta.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Odborná kvalifikace</h3>
                <div className="text-sm space-y-1">
                  <p><strong>HCPC registrace (UK):</strong> [HCPC_NUMBER] - Health and Care Professions Council</p>
                  <p><strong>HPCSA registrace (JAR):</strong> [HPCSA_NUMBER] - Health Professions Council of South Africa</p>
                  <p><strong>Nizozemsko:</strong> Notifikováno podle nizozemského zákona Wtza</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Rozsah služeb</h3>
                <p className="text-sm leading-relaxed">
                  Poskytujeme poradenství v oblasti životního stylu a lékařské výživy prostřednictvím 
                  online konzultací. Neprovádíme žádné invazivní postupy. Výsledky se mohou u jednotlivých 
                  osob lišit a nejsou zaručeny konkrétní výsledky v podobě úbytku hmotnosti.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Complaints Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Reklamace a řešení sporů
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <h3 className="font-semibold mb-3">Jak podat reklamaci</h3>
                <p className="text-sm leading-relaxed mb-2">
                  V případě nespokojenosti se službou nás kontaktujte:
                </p>
                <p className="text-sm font-medium">
                  Email: <a href="mailto:[COMPLAINTS_EMAIL]" className="text-[#A5CBA4] hover:underline">[COMPLAINTS_EMAIL]</a>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Řešení sporů</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>České klienty:</strong> Spory lze řešit u České obchodní inspekce (ČOI) 
                    prostřednictvím platformy pro řešení sporů online nebo podáním stížnosti.
                  </p>
                  <p>
                    <strong>Nizozemská jurisdikce:</strong> Pro právní spory platí nizozemské právo 
                    a jsou příslušné nizozemské soudy.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Important Notices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Důležitá upozornění
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>Nouzové služby:</strong> Tato služba neposkytuje pohotovostní péči. 
                  V případě zdravotní nouze kontaktujte okamžitě místní číslo pohotovosti.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-semibold mb-3">Zdravotní upozornění</h3>
                <p className="text-sm leading-relaxed">
                  Konzultace výživy poskytují obecné poradenství týkající se životního stylu a lékařské výživy. 
                  Tato služba poskytuje podporu, ale nenahrazuje pravidelnou lékařskou péči u vašeho lékaře. 
                  Doporučujeme koordinaci s vaším ošetřujícím lékařem.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Links to Full Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#A5CBA4]" />
                Úplná dokumentace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Pro kompletní právní informace si prosím přečtěte naše anglické dokumenty:
              </p>
              <div className="space-y-2">
                <p>
                  <a href="/terms" className="text-[#A5CBA4] hover:underline font-medium">
                    → Obchodní podmínky (Terms & Conditions)
                  </a>
                </p>
                <p>
                  <a href="/privacy" className="text-[#A5CBA4] hover:underline font-medium">
                    → Zásady ochrany osobních údajů (Privacy Policy)
                  </a>
                </p>
                <p>
                  <a href="/legal" className="text-[#A5CBA4] hover:underline font-medium">
                    → Úplné právní informace (Full Legal Information)
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 Nazdravi. Všechna práva vyhrazena.</p>
          <p className="mt-2">
            Toto je zkrácený souhrn v českém jazyce. Úplné právní informace jsou k dispozici v anglickém jazyce.
          </p>
        </div>
      </div>
    </div>
  );
}