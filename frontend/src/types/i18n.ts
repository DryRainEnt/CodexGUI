/**
 * 다국어 지원을 위한 타입 선언 파일
 */

// 지원 언어 코드
export type LanguageCode = 'en' | 'ko' | 'zh-CN' | 'ja' | 'es';

// 언어 정보 인터페이스
export interface LanguageInfo {
  code: LanguageCode;
  name: string;       // 영어로 된 언어 이름 (English, Korean, ...)
  nativeName: string; // 해당 언어로 된 언어 이름 (English, 한국어, ...)
  flag: string;       // 국가 국기 이모지
}

// 언어 선택 관련 상태 인터페이스
export interface LanguageState {
  currentLanguage: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  detectLanguage: () => LanguageCode;
}

// 다국어 날짜 형식 옵션
export interface DateFormatOptions {
  language: LanguageCode;
  format?: 'short' | 'medium' | 'long' | 'full';
  timezone?: string;
}

// 다국어 숫자 형식 옵션
export interface NumberFormatOptions {
  language: LanguageCode;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// 지역화된 날짜 형식 함수
export function formatLocalizedDate(date: Date, options: DateFormatOptions): string {
  const { language, format = 'medium', timezone } = options;
  
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: format,
      timeZone: timezone
    } as any).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return date.toLocaleDateString();
  }
}

// 지역화된 숫자 형식 함수
export function formatLocalizedNumber(
  num: number,
  options: NumberFormatOptions
): string {
  const {
    language,
    style = 'decimal',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;
  
  try {
    return new Intl.NumberFormat(language, {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num);
  } catch (e) {
    console.error('Error formatting number:', e);
    return num.toString();
  }
}
