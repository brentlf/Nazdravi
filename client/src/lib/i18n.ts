import { Translation, Language } from "@/types";

class I18n {
  private translations: Map<string, Map<string, string>> = new Map();
  private currentLang: Language = "en";
  private fallbackLang: Language = "en";

  constructor() {
    // Load saved language preference
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "nl"].includes(saved)) {
      this.currentLang = saved;
    }
  }

  setLanguage(lang: Language) {
    this.currentLang = lang;
    localStorage.setItem("language", lang);
  }

  getCurrentLanguage(): Language {
    return this.currentLang;
  }

  loadTranslations(translations: Translation[]) {
    translations.forEach(t => {
      const langKey = `${t.lang}_${t.namespace}`;
      if (!this.translations.has(langKey)) {
        this.translations.set(langKey, new Map());
      }
      this.translations.get(langKey)!.set(t.key, t.value);
    });
  }

  translate(key: string, namespace = "common", params?: Record<string, string>): string {
    const langKey = `${this.currentLang}_${namespace}`;
    const fallbackKey = `${this.fallbackLang}_${namespace}`;
    
    let translation = this.translations.get(langKey)?.get(key) ||
                     this.translations.get(fallbackKey)?.get(key) ||
                     key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }

    return translation;
  }

  t = this.translate.bind(this);
}

export const i18n = new I18n();

// Default translations
const defaultTranslations: Translation[] = [
  // English - Common
  { id: "1", lang: "en", namespace: "common", key: "welcome", value: "Welcome" },
  { id: "2", lang: "en", namespace: "common", key: "home", value: "Home" },
  { id: "3", lang: "en", namespace: "common", key: "about", value: "About" },
  { id: "4", lang: "en", namespace: "common", key: "services", value: "Services" },
  { id: "5", lang: "en", namespace: "common", key: "blog", value: "Blog" },
  { id: "6", lang: "en", namespace: "common", key: "resources", value: "Resources" },
  { id: "7", lang: "en", namespace: "common", key: "contact", value: "Contact" },
  { id: "8", lang: "en", namespace: "common", key: "login", value: "Sign In" },
  { id: "9", lang: "en", namespace: "common", key: "register", value: "Sign Up" },
  { id: "10", lang: "en", namespace: "common", key: "logout", value: "Sign Out" },
  
  // Dutch - Common
  { id: "11", lang: "nl", namespace: "common", key: "welcome", value: "Welkom" },
  { id: "12", lang: "nl", namespace: "common", key: "home", value: "Home" },
  { id: "13", lang: "nl", namespace: "common", key: "about", value: "Over Ons" },
  { id: "14", lang: "nl", namespace: "common", key: "services", value: "Diensten" },
  { id: "15", lang: "nl", namespace: "common", key: "blog", value: "Blog" },
  { id: "16", lang: "nl", namespace: "common", key: "resources", value: "Bronnen" },
  { id: "17", lang: "nl", namespace: "common", key: "contact", value: "Contact" },
  { id: "18", lang: "nl", namespace: "common", key: "login", value: "Inloggen" },
  { id: "19", lang: "nl", namespace: "common", key: "register", value: "Registreren" },
  { id: "20", lang: "nl", namespace: "common", key: "logout", value: "Uitloggen" },

  // English - Hero
  { id: "21", lang: "en", namespace: "hero", key: "title", value: "Your Journey to Better Health Starts Here" },
  { id: "22", lang: "en", namespace: "hero", key: "subtitle", value: "Transform your relationship with food through personalized nutrition plans, expert guidance, and sustainable lifestyle changes that last." },
  { id: "23", lang: "en", namespace: "hero", key: "cta_primary", value: "Book Free Consultation" },
  { id: "24", lang: "en", namespace: "hero", key: "cta_secondary", value: "Learn More" },

  // Dutch - Hero
  { id: "25", lang: "nl", namespace: "hero", key: "title", value: "Uw Reis naar Betere Gezondheid Begint Hier" },
  { id: "26", lang: "nl", namespace: "hero", key: "subtitle", value: "Transformeer uw relatie met voedsel door gepersonaliseerde voedingsplannen, deskundige begeleiding en duurzame levensstijlveranderingen die blijven." },
  { id: "27", lang: "nl", namespace: "hero", key: "cta_primary", value: "Boek Gratis Consultatie" },
  { id: "28", lang: "nl", namespace: "hero", key: "cta_secondary", value: "Meer Informatie" },
];

i18n.loadTranslations(defaultTranslations);
