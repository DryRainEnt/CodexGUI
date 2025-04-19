import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

/**
 * 언어 선택 컴포넌트
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // 지원하는 언어 목록
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' }
  ];
  
  // 언어 변경 핸들러
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    // 선택한 언어를 로컬 스토리지에 저장
    localStorage.setItem('codexgui-language', code);
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-sm">
        <GlobeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-1" aria-hidden="true" />
        
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border-0 text-gray-700 dark:text-gray-300 pr-6 pl-1 py-1 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
          aria-label={t('settings.language')}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
