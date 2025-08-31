import { globalTranslations } from './globalTranslations';

/**
 * Global Translation Function - Single Point of Access
 * No more namespace confusion or missing keys!
 */
export function gt(key: string, language: 'en' | 'cs' = 'en'): string {
  if (!key || typeof key !== 'string') {
    console.warn('Translation key is invalid:', key);
    return key || 'Invalid Key';
  }

  // Try current language first
  const translation = (globalTranslations as any)[language]?.[key];
  if (translation) {
    return translation;
  }
  
  // Fallback to English
  const englishTranslation = (globalTranslations as any)['en']?.[key];
  if (englishTranslation) {
    return englishTranslation;
  }
  
  // Final fallback: convert kebab-case to readable text
  return key.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Get all available translation keys (for development/debugging)
 */
export function getAllTranslationKeys(): string[] {
  return Object.keys(globalTranslations.en);
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string, language: 'en' | 'cs' = 'en'): boolean {
  if (!key || typeof key !== 'string') return false;
  return !!(globalTranslations as any)[language]?.[key];
}

/**
 * Get translation with parameters replacement
 */
export function gtWithParams(key: string, params: Record<string, string>, language: 'en' | 'cs' = 'en'): string {
  let translation = gt(key, language);
  
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
    });
  }
  
  return translation;
}

/**
 * Get current language from localStorage or default to 'en'
 */
export function getCurrentLanguage(): 'en' | 'cs' {
  try {
    const saved = localStorage.getItem("language") as 'en' | 'cs';
    return saved && ['en', 'cs'].includes(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Set language preference
 */
export function setLanguage(lang: 'en' | 'cs'): void {
  try {
    localStorage.setItem("language", lang);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
}