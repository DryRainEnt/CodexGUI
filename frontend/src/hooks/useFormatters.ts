import { useTranslation } from 'react-i18next';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
  formatFileSize
} from '../utils/formatters';

/**
 * 현재 선택된 언어에 기반한 포맷팅 유틸리티 함수들을 제공하는 훅
 * 컴포넌트 내에서 사용하기 적합함
 * 
 * @example
 * const { formatDate, formatNumber, formatRelativeTime } = useFormatters();
 * return (
 *   <div>
 *     <p>날짜: {formatDate(new Date())}</p>
 *     <p>숫자: {formatNumber(12345.67)}</p>
 *     <p>상대시간: {formatRelativeTime(date)}</p>
 *   </div>
 * );
 */
export function useFormatters() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  
  return {
    /**
     * 날짜를 현재 언어에 맞게 포맷팅
     * @param date 포맷팅할 날짜
     * @param options 포맷팅 옵션
     */
    formatDate: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, options, currentLocale),
    
    /**
     * 시간을 현재 언어에 맞게 포맷팅
     * @param date 포맷팅할 시간
     * @param options 포맷팅 옵션
     */
    formatTime: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => 
      formatTime(date, options, currentLocale),
    
    /**
     * 날짜와 시간을 현재 언어에 맞게 포맷팅
     * @param date 포맷팅할 날짜/시간
     * @param options 포맷팅 옵션
     */
    formatDateTime: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => 
      formatDateTime(date, options, currentLocale),
    
    /**
     * 숫자를 현재 언어에 맞게 포맷팅
     * @param value 포맷팅할 숫자
     * @param options 포맷팅 옵션
     */
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => 
      formatNumber(value, options, currentLocale),
    
    /**
     * 통화를 현재 언어와 통화 단위에 맞게 포맷팅
     * @param value 포맷팅할 금액
     * @param currencyCode 통화 코드 (예: 'USD', 'EUR', 'KRW')
     * @param options 포맷팅 옵션
     */
    formatCurrency: (value: number, currencyCode?: string, options?: Intl.NumberFormatOptions) => 
      formatCurrency(value, currencyCode, options, currentLocale),
    
    /**
     * 숫자의 퍼센트 표시를 현재 언어에 맞게 포맷팅
     * @param value 포맷팅할 숫자 (예: 0.75 = 75%)
     * @param options 포맷팅 옵션
     */
    formatPercent: (value: number, options?: Intl.NumberFormatOptions) => 
      formatPercent(value, options, currentLocale),
    
    /**
     * 상대적 시간 표시 (예: "3일 전", "방금 전")
     * @param date 비교할 날짜/시간
     * @param baseDate 기준 날짜/시간 (기본값: 현재 시간)
     * @param options 포맷팅 옵션
     */
    formatRelativeTime: (
      date: Date | number | string, 
      baseDate?: Date | number | string, 
      options?: Intl.RelativeTimeFormatOptions
    ) => formatRelativeTime(date, baseDate, options, currentLocale),
    
    /**
     * 파일 용량을 사람이 읽기 쉬운 형태로 포맷팅
     * @param bytes 바이트 단위 파일 크기
     * @param options 포맷팅 옵션
     */
    formatFileSize: (bytes: number, options?: Intl.NumberFormatOptions) => 
      formatFileSize(bytes, options, currentLocale)
  };
}

export default useFormatters;
