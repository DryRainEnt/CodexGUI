import { useTranslation } from 'react-i18next';
import { DateFormatOptions, NumberFormatOptions } from '../types/i18n';

/**
 * 다국어 지원 날짜 포맷팅 함수
 * 
 * @param date 포맷팅할 날짜
 * @param format 날짜 형식 (short, medium, long, full)
 * @param language 언어 코드 (기본값: 현재 선택된 언어)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  language?: string
): string {
  // 언어가 지정되지 않은 경우 현재 설정된 언어나 브라우저 언어 사용
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    return new Intl.DateTimeFormat(currentLanguage, {
      dateStyle: format
    } as any).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    // 오류 시 기본 형식으로 대체
    return dateObj.toLocaleDateString();
  }
}

/**
 * 다국어 지원 시간 포맷팅 함수
 * 
 * @param date 포맷팅할 날짜
 * @param format 시간 형식 (short, medium, long, full)
 * @param language 언어 코드 (기본값: 현재 선택된 언어)
 * @returns 포맷팅된 시간 문자열
 */
export function formatTime(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  language?: string
): string {
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    return new Intl.DateTimeFormat(currentLanguage, {
      timeStyle: format
    } as any).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * 다국어 지원 날짜+시간 포맷팅 함수
 * 
 * @param date 포맷팅할 날짜
 * @param dateFormat 날짜 형식
 * @param timeFormat 시간 형식
 * @param language 언어 코드
 * @returns 포맷팅된 날짜와 시간 문자열
 */
export function formatDateTime(
  date: Date | string | number,
  dateFormat: 'short' | 'medium' | 'long' | 'full' = 'medium',
  timeFormat: 'short' | 'medium' | 'long' | 'full' = 'short',
  language?: string
): string {
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    return new Intl.DateTimeFormat(currentLanguage, {
      dateStyle: dateFormat,
      timeStyle: timeFormat
    } as any).format(dateObj);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
  }
}

/**
 * 다국어 지원 숫자 포맷팅 함수
 * 
 * @param value 포맷팅할 숫자
 * @param language 언어 코드
 * @param options 추가 옵션
 * @returns 포맷팅된 숫자 문자열
 */
export function formatNumber(
  value: number,
  language?: string,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  
  try {
    return new Intl.NumberFormat(currentLanguage, options).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toLocaleString();
  }
}

/**
 * 다국어 지원 화폐 포맷팅 함수
 * 
 * @param value 포맷팅할 금액
 * @param currency 화폐 코드 (예: USD, KRW, JPY)
 * @param language 언어 코드
 * @returns 포맷팅된 화폐 문자열
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  language?: string
): string {
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  
  try {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: currency
    }).format(value);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${value.toLocaleString()}`;
  }
}

/**
 * 다국어 지원 퍼센트 포맷팅 함수
 * 
 * @param value 포맷팅할 값 (0.x 형식)
 * @param options 추가 옵션
 * @param language 언어 코드
 * @returns 포맷팅된 퍼센트 문자열
 */
export function formatPercent(
  value: number,
  options: Partial<Intl.NumberFormatOptions> = {},
  language?: string
): string {
  const currentLanguage = language || localStorage.getItem('codexgui-language') || navigator.language;
  
  try {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'percent',
      ...options
    }).format(value);
  } catch (error) {
    console.error('Percent formatting error:', error);
    return `${(value * 100).toFixed(2)}%`;
  }
}

/**
 * 리액트 컴포넌트에서 사용하기 위한 포맷팅 Hook
 * 
 * @returns 포맷팅 함수 모음
 */
export function useFormatters() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  return {
    formatDate: (date: Date | string | number, format?: 'short' | 'medium' | 'long' | 'full') => 
      formatDate(date, format, currentLanguage),
    
    formatTime: (date: Date | string | number, format?: 'short' | 'medium' | 'long' | 'full') => 
      formatTime(date, format, currentLanguage),
    
    formatDateTime: (
      date: Date | string | number,
      dateFormat?: 'short' | 'medium' | 'long' | 'full',
      timeFormat?: 'short' | 'medium' | 'long' | 'full'
    ) => formatDateTime(date, dateFormat, timeFormat, currentLanguage),
    
    formatNumber: (value: number, options?: Partial<Intl.NumberFormatOptions>) => 
      formatNumber(value, currentLanguage, options),
    
    formatCurrency: (value: number, currency?: string) => 
      formatCurrency(value, currency, currentLanguage),
    
    formatPercent: (value: number, options?: Partial<Intl.NumberFormatOptions>) => 
      formatPercent(value, options, currentLanguage)
  };
}
