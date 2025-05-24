import { globalTranslations } from './globalTranslations';

/**
 * Global Translation Function - Single Point of Access
 * No more namespace confusion or missing keys!
 */
export function gt(key: string, language: 'en' | 'cs' = 'en'): string {
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
  return !!(globalTranslations as any)[language]?.[key];
}