import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { I18nextProvider } from 'react-i18next';
import LanguageSelector from '../components/ui/LanguageSelector';
import { supportedLanguages } from '../i18n';
import { formatDate, formatNumber, formatPercent } from '../utils/formatters';

// i18next 초기화 대기
beforeEach(async () => {
  await i18n.changeLanguage('en');
});

// 테스트가 끝나면 항상 영어로 재설정
afterEach(async () => {
  await i18n.changeLanguage('en');
  localStorage.removeItem('codexgui-language');
});

describe('i18n config', () => {
  test('should initialize with default language (영어)', () => {
    expect(i18n.language).toBe('en');
  });

  test('should list all supported languages', () => {
    const languages = supportedLanguages.map(lang => lang.code);
    expect(languages).toContain('en');
    expect(languages).toContain('ko');
    expect(languages).toContain('zh-CN');
    expect(languages).toContain('ja');
    expect(languages).toContain('es');
  });

  test('should change language', async () => {
    await i18n.changeLanguage('ko');
    expect(i18n.language).toBe('ko');
    
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  test('should persist language preference to localStorage', async () => {
    localStorage.setItem('codexgui-language', 'ko');
    
    // 새 i18n 인스턴스를 생성하여 localStorage 적용 테스트
    // 실제로는 인스턴스를 새로 생성하지 않고 테스트만을 위한 시뮬레이션
    vi.spyOn(localStorage, 'getItem').mockReturnValueOnce('ko');
    
    await i18n.changeLanguage(null); // 언어 감지 트리거
    expect(i18n.language).toBe('ko');
  });
});

describe('LanguageSelector component', () => {
  test('should render with current language', async () => {
    await i18n.changeLanguage('en');
    
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSelector />
      </I18nextProvider>
    );
    
    // English가 선택되어 있음
    const languageButton = screen.getByRole('button', { name: /select language/i });
    expect(languageButton).toBeInTheDocument();
    expect(languageButton.textContent).toContain('English');
  });

  test('should open dropdown on click', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('en');
    
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSelector />
      </I18nextProvider>
    );
    
    const languageButton = screen.getByRole('button', { name: /select language/i });
    await user.click(languageButton);
    
    // 드롭다운 메뉴가 열림
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // 모든 지원 언어가 표시됨
    supportedLanguages.forEach(lang => {
      expect(screen.getByText(lang.nativeName)).toBeInTheDocument();
    });
  });

  test('should change language when an option is selected', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('en');
    
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSelector />
      </I18nextProvider>
    );
    
    // 언어 선택 드롭다운 열기
    const languageButton = screen.getByRole('button', { name: /select language/i });
    await user.click(languageButton);
    
    // 한국어 선택
    const koreanOption = screen.getByText('한국어');
    await user.click(koreanOption);
    
    // 언어가 변경되고 localStorage에 저장됨
    expect(i18n.language).toBe('ko');
    expect(localStorage.getItem('codexgui-language')).toBe('ko');
  });
});

describe('Formatting utilities', () => {
  test('should format dates according to locale', () => {
    const testDate = new Date(2025, 3, 20); // 2025-04-20
    
    // 영어 (미국) 형식
    expect(formatDate(testDate, { dateStyle: 'short' }, 'en-US'))
      .toMatch(/4\/20\/2025|4\/20\/25/); // 날짜 형식 패턴 확인
    
    // 한국어 형식
    expect(formatDate(testDate, { dateStyle: 'short' }, 'ko'))
      .toMatch(/2025\. 4\. 20\.|2025년 4월 20일/); // 날짜 형식 패턴 확인
  });

  test('should format numbers according to locale', () => {
    const testNumber = 1234567.89;
    
    // 영어 (미국) 형식: 1,234,567.89
    expect(formatNumber(testNumber, {}, 'en-US')).toBe('1,234,567.89');
    
    // 독일어 형식: 1.234.567,89
    expect(formatNumber(testNumber, {}, 'de')).toBe('1.234.567,89');
  });

  test('should format percentages according to locale', () => {
    const testValue = 0.7568;
    
    // 영어 (미국) 형식: 75.68%
    expect(formatPercent(testValue, { minimumFractionDigits: 2 }, 'en-US')).toBe('75.68%');
    
    // 한국어 형식: 76%
    expect(formatPercent(testValue, { maximumFractionDigits: 0 }, 'ko')).toBe('76%');
  });
});
