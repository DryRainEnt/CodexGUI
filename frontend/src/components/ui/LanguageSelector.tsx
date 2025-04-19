import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon, CheckIcon } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * 언어 선택 컴포넌트 - 표시 방식 개선
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  
  // 지원하는 언어 목록
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
  ];
  
  // 언어 변경 핸들러
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    // 선택한 언어를 로컬 스토리지에 저장
    localStorage.setItem('codexgui-language', code);
    setIsOpen(false);
  };

  // 현재 언어 정보 가져오기
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };
  
  // 접근성 이벤트 처리 - 에스케이프 키로 드롭다운 닫기
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const currentIndex = languages.findIndex(lang => lang.code === currentLanguage);
      const nextIndex = e.key === 'ArrowDown'
        ? (currentIndex + 1) % languages.length
        : (currentIndex - 1 + languages.length) % languages.length;
      
      changeLanguage(languages[nextIndex].code);
    }
  };
  
  return (
    <div 
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="flex items-center space-x-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-2 text-sm transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('settings.language')}
      >
        <GlobeIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        <span className="hidden sm:inline">{getCurrentLanguage().flag}</span>
        <span className="hidden md:inline text-gray-700 dark:text-gray-300">{getCurrentLanguage().nativeName}</span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-1 py-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="listbox"
          aria-label={t('settings.language')}
          tabIndex={0}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left ${currentLanguage === lang.code ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => changeLanguage(lang.code)}
              role="option"
              aria-selected={currentLanguage === lang.code}
            >
              <div className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {currentLanguage === lang.code && (
                <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
