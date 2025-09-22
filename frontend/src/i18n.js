import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationBG from './locales/bg/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  bg: {
    translation: translationBG
  }
};

i18n
  .use(LanguageDetector) // Определяет язык пользователя
  .use(initReactI18next) // Передает i18n в react-i18next
  .init({
    resources,
    fallbackLng: 'bg', // Язык по умолчанию, если язык пользователя недоступен
    interpolation: {
      escapeValue: false // React уже защищает от XSS
    }
  });

export default i18n;