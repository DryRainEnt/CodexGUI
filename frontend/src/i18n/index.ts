import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locales
import en from './locales/en.json';
import ko from './locales/ko.json';
// 추가 언어 지원을 위한 import
import zhCN from './locales/zh-CN.json';
import ja from './locales/ja.json';
import es from './locales/es.json';

// 지원 언어 목록
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

// 사용자가 선택한 언어 또는 브라우저 언어로 초기화
const savedLanguage = localStorage.getItem('codexgui-language');

// 초기화 옵션
i18n
  // 브라우저 언어 감지 기능 추가
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
      'zh-CN': { translation: zhCN },
      ja: { translation: ja },
      es: { translation: es },
    },
    lng: savedLanguage || undefined, // undefined로 설정하면 LanguageDetector가 자동으로 감지
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'codexgui-language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
