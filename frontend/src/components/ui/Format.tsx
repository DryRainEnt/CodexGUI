import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../utils/formatters';

/**
 * 날짜 표시 포맷 타입
 */
type DateFormat = 'short' | 'medium' | 'long' | 'full';

/**
 * 날짜 형식화 컴포넌트 props
 */
interface DateProps {
  date: Date | string | number;
  format?: DateFormat;
  className?: string;
}

/**
 * 시간 형식화 컴포넌트 props
 */
interface TimeProps {
  date: Date | string | number;
  format?: DateFormat;
  className?: string;
}

/**
 * 날짜 및 시간 형식화 컴포넌트 props
 */
interface DateTimeProps {
  date: Date | string | number;
  dateFormat?: DateFormat;
  timeFormat?: DateFormat;
  className?: string;
}

/**
 * 숫자 형식화 컴포넌트 props
 */
interface NumberProps {
  value: number;
  options?: Partial<Intl.NumberFormatOptions>;
  className?: string;
}

/**
 * 화폐 형식화 컴포넌트 props
 */
interface CurrencyProps {
  value: number;
  currency?: string;
  className?: string;
}

/**
 * 지역화된 날짜 표시 컴포넌트
 */
export const FormattedDate: React.FC<DateProps> = ({ date, format = 'medium', className }) => {
  const formatters = useFormatters();
  return <span className={className}>{formatters.formatDate(date, format)}</span>;
};

/**
 * 지역화된 시간 표시 컴포넌트
 */
export const FormattedTime: React.FC<TimeProps> = ({ date, format = 'short', className }) => {
  const formatters = useFormatters();
  return <span className={className}>{formatters.formatTime(date, format)}</span>;
};

/**
 * 지역화된 날짜 및 시간 표시 컴포넌트
 */
export const FormattedDateTime: React.FC<DateTimeProps> = ({ 
  date, 
  dateFormat = 'medium', 
  timeFormat = 'short',
  className 
}) => {
  const formatters = useFormatters();
  return (
    <span className={className}>
      {formatters.formatDateTime(date, dateFormat, timeFormat)}
    </span>
  );
};

/**
 * 지역화된 숫자 표시 컴포넌트
 */
export const FormattedNumber: React.FC<NumberProps> = ({ value, options, className }) => {
  const formatters = useFormatters();
  return <span className={className}>{formatters.formatNumber(value, options)}</span>;
};

/**
 * 지역화된 화폐 표시 컴포넌트
 */
export const FormattedCurrency: React.FC<CurrencyProps> = ({ value, currency, className }) => {
  const formatters = useFormatters();
  return <span className={className}>{formatters.formatCurrency(value, currency)}</span>;
};

/**
 * 상대적 시간 표시 컴포넌트 (예: "3분 전", "2일 전")
 */
export const RelativeTime: React.FC<{ date: Date | string | number; className?: string }> = ({ 
  date, 
  className 
}) => {
  const { i18n } = useTranslation();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // 현재 시간과의 차이 계산 (밀리초)
  const timeDiff = Date.now() - dateObj.getTime();
  const language = i18n.language;
  
  // 상대 시간 포맷팅을 위한 RelativeTimeFormat 사용
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  
  const getRelativeTime = () => {
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) {
      return rtf.format(-seconds, 'second');
    } else if (minutes < 60) {
      return rtf.format(-minutes, 'minute');
    } else if (hours < 24) {
      return rtf.format(-hours, 'hour');
    } else if (days < 30) {
      return rtf.format(-days, 'day');
    } else if (months < 12) {
      return rtf.format(-months, 'month');
    } else {
      return rtf.format(-years, 'year');
    }
  };
  
  return <span className={className}>{getRelativeTime()}</span>;
};
