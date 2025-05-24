import { translations } from './translations';

/**
 * Robust translation utility that automatically handles missing translations
 * and provides comprehensive fallback mechanisms
 */

type TranslationNamespace = keyof typeof translations.en;

interface TranslationOptions {
  params?: Record<string, string>;
  fallback?: string;
  logMissing?: boolean;
}

// Track missing translations for development
const missingTranslations = new Set<string>();

/**
 * Enhanced translation function with robust fallback system
 */
export function translate(
  key: string, 
  namespace: TranslationNamespace = 'common',
  language: 'en' | 'cs' = 'en',
  options: TranslationOptions = {}
): string {
  const { params, fallback, logMissing = true } = options;
  
  try {
    // Try current language first
    const currentLangTranslation = (translations as any)[language]?.[namespace]?.[key];
    if (currentLangTranslation) {
      return interpolateParams(currentLangTranslation, params);
    }
    
    // Fallback to English
    const englishTranslation = (translations as any)['en']?.[namespace]?.[key];
    if (englishTranslation) {
      return interpolateParams(englishTranslation, params);
    }
    
    // Use provided fallback
    if (fallback) {
      return interpolateParams(fallback, params);
    }
    
    // Log missing translation for development
    if (logMissing && process.env.NODE_ENV === 'development') {
      const missingKey = `${language}.${namespace}.${key}`;
      if (!missingTranslations.has(missingKey)) {
        console.warn(`Missing translation: ${missingKey}`);
        missingTranslations.add(missingKey);
      }
    }
    
    // Convert kebab-case to readable text as final fallback
    return kebabToReadable(key);
    
  } catch (error) {
    console.error('Translation error:', error);
    return fallback || kebabToReadable(key);
  }
}

/**
 * Convert kebab-case keys to readable text
 * Example: "meal-planning-title" -> "Meal Planning Title"
 */
function kebabToReadable(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Interpolate parameters into translation strings
 */
function interpolateParams(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }, text);
}

/**
 * Get all missing translations for debugging
 */
export function getMissingTranslations(): string[] {
  return Array.from(missingTranslations);
}

/**
 * Clear missing translations log
 */
export function clearMissingTranslations(): void {
  missingTranslations.clear();
}

/**
 * Validate that all required translations exist for a namespace
 */
export function validateTranslations(
  namespace: TranslationNamespace,
  requiredKeys: string[],
  language: 'en' | 'cs' = 'en'
): { missing: string[], existing: string[] } {
  const namespaceTranslations = (translations as any)[language]?.[namespace] || {};
  const existing: string[] = [];
  const missing: string[] = [];
  
  requiredKeys.forEach(key => {
    if (namespaceTranslations[key]) {
      existing.push(key);
    } else {
      missing.push(key);
    }
  });
  
  return { missing, existing };
}

/**
 * Auto-generate missing translation keys with readable fallbacks
 */
export function generateMissingTranslations(
  namespace: TranslationNamespace,
  keys: string[],
  language: 'en' | 'cs' = 'en'
): Record<string, string> {
  const generated: Record<string, string> = {};
  
  keys.forEach(key => {
    const readable = kebabToReadable(key);
    generated[key] = language === 'cs' ? 
      `[CS] ${readable}` : // Placeholder for Czech
      readable; // English readable version
  });
  
  return generated;
}