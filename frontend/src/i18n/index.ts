import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

// 기본 영어와 한국어만 즉시 로드 (Lazy Loading 적용)
import en from './locales/en.json';
import ko from './locales/ko.json';

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
  // 백엔드 설정 - 로컬 스토리지 캐싱 및 지연 로딩 활성화
  .use(ChainedBackend)
  // 브라우저 언어 감지 기능 추가
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    
    // 지연 로딩을 위한 백엔드 설정
    backend: {
      backends: [
        LocalStorageBackend, // 로컬 스토리지 캐싱
        Backend // HTTP 백엔드 (나중에 CDN 사용 가능)
      ],
      backendOptions: [{
        // 로컬 스토리지 옵션
        prefix: 'codexgui_i18n_',
        expirationTime: 7 * 24 * 60 * 60 * 1000, // 7일
        defaultVersion: 'v1.0.0'
      }, {
        // HTTP 백엔드 옵션
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      }]
    },
    
    // 지연 로딩 활성화
    partialBundledLanguages: true,
    load: 'languageOnly', // 언어 코드만 사용 (ko-KR -> ko)
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
