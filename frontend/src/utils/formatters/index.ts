/**
 * 날짜, 숫자, 통화 등의 지역화 포맷팅을 위한 유틸리티 함수들
 * 브라우저의 Intl API를 활용하여 현재 언어에 맞는 포맷팅 제공
 */

/**
 * 날짜를 현재 언어에 맞게 포맷팅
 * @param date 포맷팅할 날짜 (Date 객체 또는 timestamp)
 * @param options 포맷팅 옵션 (Intl.DateTimeFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 날짜 문자열
 * @example formatDate(new Date(), { dateStyle: 'full' }) // '2025년 4월 20일 일요일' (ko)
 */
export const formatDate = (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale?: string
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.DateTimeFormat(currentLocale, options).format(dateObj);
};

/**
 * 시간을 현재 언어에 맞게 포맷팅
 * @param date 포맷팅할 날짜/시간 (Date 객체 또는 timestamp)
 * @param options 포맷팅 옵션 (Intl.DateTimeFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 시간 문자열
 * @example formatTime(new Date(), { timeStyle: 'short' }) // '오후 3:30' (ko)
 */
export const formatTime = (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
  locale?: string
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.DateTimeFormat(currentLocale, options).format(dateObj);
};

/**
 * 날짜와 시간을 현재 언어에 맞게 포맷팅
 * @param date 포맷팅할 날짜/시간 (Date 객체 또는 timestamp)
 * @param options 포맷팅 옵션 (Intl.DateTimeFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 날짜/시간 문자열
 * @example formatDateTime(new Date()) // '2025. 4. 20. 오후 3:30' (ko)
 */
export const formatDateTime = (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
  locale?: string
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.DateTimeFormat(currentLocale, options).format(dateObj);
};

/**
 * 숫자를 현재 언어에 맞게 포맷팅
 * @param value 포맷팅할 숫자
 * @param options 포맷팅 옵션 (Intl.NumberFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 숫자 문자열
 * @example formatNumber(1234567.89) // '1,234,567.89' (en) 또는 '1.234.567,89' (de)
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale?: string
): string => {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.NumberFormat(currentLocale, options).format(value);
};

/**
 * 통화를 현재 언어와 통화 단위에 맞게 포맷팅
 * @param value 포맷팅할 금액
 * @param currencyCode 통화 코드 (예: 'USD', 'EUR', 'KRW')
 * @param options 포맷팅 옵션 (Intl.NumberFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 통화 문자열
 * @example formatCurrency(1234.56, 'USD') // '$1,234.56' (en)
 */
export const formatCurrency = (
  value: number,
  currencyCode: string = 'USD',
  options: Intl.NumberFormatOptions = {},
  locale?: string
): string => {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currencyCode,
    ...options
  }).format(value);
};

/**
 * 숫자의 퍼센트 표시를 현재 언어에 맞게 포맷팅
 * @param value 포맷팅할 숫자 (예: 0.75 = 75%)
 * @param options 포맷팅 옵션 (Intl.NumberFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 퍼센트 문자열
 * @example formatPercent(0.7568) // '75.68%' (en)
 */
export const formatPercent = (
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale?: string
): string => {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.NumberFormat(currentLocale, {
    style: 'percent',
    ...options
  }).format(value);
};

/**
 * 상대적 시간 표시 (예: "3일 전", "방금 전")
 * @param date 비교할 날짜/시간 (Date 객체 또는 timestamp)
 * @param baseDate 기준 날짜/시간 (기본값: 현재 시간)
 * @param options 포맷팅 옵션 (Intl.RelativeTimeFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 상대적 시간 문자열
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) // '1시간 전' (ko)
 */
export const formatRelativeTime = (
  date: Date | number | string,
  baseDate?: Date | number | string,
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
  locale?: string
): string => {
  const targetDate = date instanceof Date ? date : new Date(date);
  const baseDateTime = baseDate ? (baseDate instanceof Date ? baseDate : new Date(baseDate)) : new Date();
  const currentLocale = locale || getCurrentLanguage();
  
  const formatter = new Intl.RelativeTimeFormat(currentLocale, options);
  
  const diffInSeconds = Math.floor((targetDate.getTime() - baseDateTime.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);
  
  // 적절한 시간 단위 선택
  if (absDiff < 60) {
    return formatter.format(Math.sign(diffInSeconds) * absDiff, 'second');
  } else if (absDiff < 3600) {
    return formatter.format(Math.sign(diffInSeconds) * Math.floor(absDiff / 60), 'minute');
  } else if (absDiff < 86400) {
    return formatter.format(Math.sign(diffInSeconds) * Math.floor(absDiff / 3600), 'hour');
  } else if (absDiff < 2592000) {
    return formatter.format(Math.sign(diffInSeconds) * Math.floor(absDiff / 86400), 'day');
  } else if (absDiff < 31536000) {
    return formatter.format(Math.sign(diffInSeconds) * Math.floor(absDiff / 2592000), 'month');
  } else {
    return formatter.format(Math.sign(diffInSeconds) * Math.floor(absDiff / 31536000), 'year');
  }
};

/**
 * 현재 앱 언어 코드 반환
 * @returns 현재 언어 코드 (예: 'en', 'ko', 'zh-CN')
 */
const getCurrentLanguage = (): string => {
  // i18next에서 직접 가져오기보다는 localStorage에서 확인하여 의존성 감소
  return localStorage.getItem('codexgui-language') || navigator.language || 'en';
};

/**
 * 파일 용량을 사람이 읽기 쉬운 형태로 포맷팅
 * @param bytes 바이트 단위 파일 크기
 * @param options 포맷팅 옵션 (Intl.NumberFormatOptions)
 * @param locale 사용할 locale (기본값: 현재 언어)
 * @returns 포맷팅된 파일 크기 문자열 (예: '1.5 MB')
 */
export const formatFileSize = (
  bytes: number,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 1 },
  locale?: string
): string => {
  const currentLocale = locale || getCurrentLanguage();
  
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const formattedNumber = new Intl.NumberFormat(currentLocale, options).format(
    bytes / Math.pow(k, i)
  );
  
  return `${formattedNumber} ${sizes[i]}`;
};
