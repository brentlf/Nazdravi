import { Translation, Language } from "@/types/index";

class I18n {
  private translations: Map<string, Map<string, string>> = new Map();
  private currentLang: Language = "en";
  private fallbackLang: Language = "en";

  constructor() {
    // Load saved language preference
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "cs"].includes(saved)) {
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

// Import the comprehensive translations from the translations file
import { translations } from "./translations";

// Convert the existing translations structure to the format expected by i18n
const convertedTranslations: Translation[] = [];
let translationId = 1;

// Convert English translations
Object.entries(translations.en).forEach(([namespace, namespaceTranslations]) => {
  Object.entries(namespaceTranslations).forEach(([key, value]) => {
    convertedTranslations.push({
      id: translationId.toString(),
      lang: "en",
      namespace,
      key,
      value
    });
    translationId++;
  });
});

// Convert Czech translations
Object.entries(translations.cs).forEach(([namespace, namespaceTranslations]) => {
  Object.entries(namespaceTranslations).forEach(([key, value]) => {
    convertedTranslations.push({
      id: translationId.toString(),
      lang: "cs",
      namespace,
      key,
      value
    });
    translationId++;
  });
});

const defaultTranslations = convertedTranslations;

i18n.loadTranslations(defaultTranslations);
