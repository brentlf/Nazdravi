// Sample translations for Vee Nutrition website
// This will be enhanced to work with your Firebase translations collection

export const translations = {
  en: {
    common: {
      'home': 'Home',
      'about': 'About',
      'services': 'Services',
      'blog': 'Blog',
      'resources': 'Resources',
      'contact': 'Contact',
      'book-consultation': 'Book Consultation',
      'login': 'Login',
      'register': 'Register',
      'dashboard': 'Dashboard',
      'logout': 'Logout',
      'language': 'Language',
      'theme': 'Theme',
    },
    navigation: {
      'book-appointment': 'Book Appointment',
      'start-consultation': 'Start Consultation',
      'view-plans': 'View Plans',
      'track-progress': 'Track Progress',
      'messages': 'Messages',
    },
    home: {
      'hero-title': 'Transform Your Health with Expert Nutrition Guidance',
      'hero-subtitle': 'Personalized nutrition consultations in English and Czech to help you achieve your wellness goals',
      'language-notice': 'Professional care provided exclusively in English (primary) and Czech (upon request)',
      'get-started': 'Get Started',
      'learn-more': 'Learn More',
    },
    services: {
      'title': 'Nutrition Services',
      'subtitle': 'Evidence-based nutrition care tailored to your needs',
      'initial-consultation': 'Initial Consultation',
      'follow-up': 'Follow-up Consultation',
      'meal-planning': 'Meal Planning',
      'progress-tracking': 'Progress Tracking',
    },
    legal: {
      'language-services': 'Language Services',
      'care-provided-in': 'Care is provided exclusively in English (primary) and Czech (upon request)',
      'emergency-disclaimer': 'This service does not provide emergency care',
      'private-service': 'This is a private healthcare service',
      'professional-registration': 'Professional Registration',
    },
    consent: {
      'language-confirmation': 'I confirm I can read, speak and understand English OR Czech',
      'private-service': 'I understand services are private, not emergency care',
      'video-consent': 'I consent to video consultation and electronic record-keeping under GDPR',
      'results-vary': 'I acknowledge results vary and no specific weight-loss amount is guaranteed',
      'sa-follow-up': 'I understand local follow-up with a physician may be required (HPCSA Booklet 10)',
      'proceed-booking': 'Proceed to Booking',
    }
  },
  cs: {
    common: {
      'home': 'Domů',
      'about': 'O nás',
      'services': 'Služby',
      'blog': 'Blog',
      'resources': 'Zdroje',
      'contact': 'Kontakt',
      'book-consultation': 'Rezervovat konzultaci',
      'login': 'Přihlášení',
      'register': 'Registrace',
      'dashboard': 'Dashboard',
      'logout': 'Odhlášení',
      'language': 'Jazyk',
      'theme': 'Téma',
    },
    navigation: {
      'book-appointment': 'Rezervovat termín',
      'start-consultation': 'Začít konzultaci',
      'view-plans': 'Zobrazit plány',
      'track-progress': 'Sledovat pokrok',
      'messages': 'Zprávy',
    },
    home: {
      'hero-title': 'Transformujte své zdraví s odborným nutričním vedením',
      'hero-subtitle': 'Personalizované nutriční konzultace v angličtině a češtině pro dosažení vašich zdravotních cílů',
      'language-notice': 'Odborná péče poskytována výhradně v angličtině (primárně) a češtině (na požádání)',
      'get-started': 'Začít',
      'learn-more': 'Dozvědět se více',
    },
    services: {
      'title': 'Nutriční služby',
      'subtitle': 'Nutriční péče založená na důkazech přizpůsobená vašim potřebám',
      'initial-consultation': 'Počáteční konzultace',
      'follow-up': 'Následná konzultace',
      'meal-planning': 'Plánování jídel',
      'progress-tracking': 'Sledování pokroku',
    },
    legal: {
      'language-services': 'Jazykové služby',
      'care-provided-in': 'Péče je poskytována výhradně v angličtině (primárně) a češtině (na požádání)',
      'emergency-disclaimer': 'Tato služba neposkytuje pohotovostní péči',
      'private-service': 'Toto je soukromá zdravotní služba',
      'professional-registration': 'Profesní registrace',
    },
    consent: {
      'language-confirmation': 'Potvrzuji, že umím číst, mluvit a rozumím anglicky NEBO česky',
      'private-service': 'Rozumím, že služby jsou soukromé, nejde o pohotovostní péči',
      'video-consent': 'Souhlasím s video konzultací a elektronickým vedením záznamů podle GDPR',
      'results-vary': 'Uznávám, že výsledky se liší a nejsou zaručeny konkrétní množství úbytku hmotnosti',
      'sa-follow-up': 'Rozumím, že může být vyžadována místní následná péče u lékaře (HPCSA Booklet 10)',
      'proceed-booking': 'Pokračovat k rezervaci',
    }
  }
};

// Helper function to get translation
export function getTranslation(key: string, language: 'en' | 'cs', namespace: string = 'common'): string {
  const langData = translations[language];
  const namespaceData = langData[namespace as keyof typeof langData] as Record<string, string>;
  return namespaceData?.[key] || key;
}