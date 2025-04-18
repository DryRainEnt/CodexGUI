import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locales
import en from './locales/en.json';
import ko from './locales/ko.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko }
    },
    lng: navigator.language.startsWith('ko') ? 'ko' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    }
  });

export default i18n;
