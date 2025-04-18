import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 테스트에서 사용할 번역 문자열 정의
const resources = {
  en: {
    translation: {
      'launch.title': 'Welcome to CodexGUI',
      'launch.subtitle': 'Git repository analysis and LLM conversation logs',
      'launch.apiKeyInput': 'Enter your OpenAI API Key',
      'launch.apiKeyPlaceholder': 'sk-...',
      'launch.validateButton': 'Validate and Start',
      'launch.validatingMessage': 'Validating...',
      'launch.emptyKeyError': 'API key cannot be empty',
      'launch.invalidKeyError': 'Invalid API key. Please check and try again.',
      'launch.invalidKeyFormatError': 'Invalid API key format',
      'launch.rateLimitError': 'Rate limit exceeded. Please try again later.',
      'launch.networkError': 'Network error. Please check your connection.',
      'launch.serverError': 'Server error',
      'launch.unknownError': 'An unknown error occurred',
      'launch.sessionExpiredError': 'Session expired. Please authenticate again.',
      'launch.apiKeySecurityNote': 'Your API key is encrypted and stored locally only',
      'app.version': 'Web Edition v0.1.0',
      'app.help': 'Help'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React에서는 이미 XSS를 방지하므로 불필요
    },
    react: {
      useSuspense: false // 테스트 환경에서는 Suspense 사용하지 않음
    }
  });

export default i18n;
