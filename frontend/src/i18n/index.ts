import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locales
import en from './locales/en.json';
import ko from './locales/ko.json';

// 사용자가 선택한 언어 또는 브라우저 언어로 초기화
const savedLanguage = localStorage.getItem('codexgui-language');
const initialLanguage = savedLanguage || (navigator.language.startsWith('ko') ? 'ko' : 'en');

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    }
  });

export default i18n;
