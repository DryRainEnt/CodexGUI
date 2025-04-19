import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { supportedLanguages } from '../../i18n';

interface LanguageSelectorProps {
  className?: string;
}

/**
 * 언어 선택 컴포넌트 - 드롭다운 메뉴 방식
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // 외부 클릭 감지 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // ESC 키 처리 
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);
  
  // 언어 변경 핸들러
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    // 선택한 언어를 로컬 스토리지에 저장
    localStorage.setItem('codexgui-language', code);
    setIsOpen(false);
  };

  // 현재 언어 정보 가져오기
  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };
  
  // 메뉴 버튼 키보드 처리
  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      // 첫 번째 메뉴 항목에 포커스
      setTimeout(() => {
        const firstOption = menuRef.current?.querySelector('button');
        if (firstOption instanceof HTMLElement) {
          firstOption.focus();
        }
      }, 10);
    }
  };

  // 메뉴 항목 키보드 처리
  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const menuButtons = menuRef.current?.querySelectorAll('button') || [];
      const currentFocusIndex = Array.from(menuButtons).findIndex(button => button === document.activeElement);
      
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (currentFocusIndex + 1) % menuButtons.length;
      } else {
        nextIndex = (currentFocusIndex - 1 + menuButtons.length) % menuButtons.length;
      }
      
      (menuButtons[nextIndex] as HTMLElement).focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const activeElement = document.activeElement as HTMLElement;
      activeElement.click();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };
  
  return (
    <div 
      className={`relative ${className}`}
    >
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center space-x-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-2 text-sm transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('settings.languageSelector', 'Select language - Current: {{language}}', { language: getCurrentLanguage().nativeName })}
        aria-controls="language-menu"
      >
        <GlobeIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        <span className="hidden sm:inline">{getCurrentLanguage().flag}</span>
        <span className="hidden md:inline text-gray-700 dark:text-gray-300">{getCurrentLanguage().nativeName}</span>
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          id="language-menu"
          className="absolute right-0 mt-1 py-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="listbox"
          aria-label={t('settings.languageOptions', 'Available languages')}
          aria-activedescendant={`language-option-${currentLanguage}`}
          onKeyDown={handleMenuKeyDown}
        >
          {supportedLanguages.map((lang) => (
            <button
              id={`language-option-${lang.code}`}
              key={lang.code}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left ${currentLanguage === lang.code ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => changeLanguage(lang.code)}
              role="option"
              aria-selected={currentLanguage === lang.code}
              aria-label={`${lang.nativeName} (${lang.name})`}
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
