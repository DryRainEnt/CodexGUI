import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircleIcon, CheckCircleIcon, BarChartIcon } from 'lucide-react';

interface TokenUsageProps {
  totalTokensUsed?: number;
  remainingTokens?: number;
  totalSpent?: string;
  quota?: string;
  usagePercent?: number;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * 토큰 사용량을 시각적으로 표시하는 컴포넌트
 */
const TokenUsage: React.FC<TokenUsageProps> = ({
  totalTokensUsed = 0,
  remainingTokens = 0,
  totalSpent = '$0.00',
  quota = '$0.00',
  usagePercent = 0,
  isLoading = false,
  error = null,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // 사용량 수준에 따른 색상 및 메시지 결정
  const getUsageLevel = () => {
    if (usagePercent >= 90) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500 dark:bg-red-600',
        bgOpacity: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        icon: <AlertCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />,
        message: t('tokens.criticalLevel'),
        ariaLabel: t('tokens.criticalLevelDescription')
      };
    } else if (usagePercent >= 70) {
      return {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500 dark:bg-amber-600',
        bgOpacity: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-300',
        icon: <AlertCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
        message: t('tokens.warningLevel'),
        ariaLabel: t('tokens.warningLevelDescription')
      };
    } else {
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500 dark:bg-green-600',
        bgOpacity: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        icon: <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />,
        message: t('tokens.goodLevel'),
        ariaLabel: t('tokens.goodLevelDescription')
      };
    }
  };
  
  const usageLevel = getUsageLevel();
  
  // 숫자 포맷팅 (천 단위 구분)
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  // 로딩 상태일 때 보여줄 스켈레톤 UI
  if (isLoading) {
    return (
      <div 
        className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}
        role="status"
        aria-live="polite"
        aria-label={t('tokens.loading')}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
        <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-full"></div>
        <div className="flex justify-between mb-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    );
  }
  
  // 에러 상태일 때 보여줄 UI
  if (error) {
    return (
      <div 
        className={`p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
          <AlertCircleIcon className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">{t('tokens.errorLoading')}</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`p-3 rounded-lg ${usageLevel.bgOpacity} ${className}`}
      role="region"
      aria-label={t('tokens.usageTitle')}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <BarChartIcon className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">{t('tokens.usageTitle')}</span>
        </div>
        <span 
          className={`text-xs font-semibold ${usageLevel.color} px-2 py-0.5 rounded-full bg-opacity-10 bg-current`}
          title={usageLevel.ariaLabel}
        >
          {usageLevel.message}
        </span>
      </div>
      
      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full ${usageLevel.bgColor} rounded-full transition-all duration-500 ease-in-out`} 
          style={{ width: `${usagePercent}%` }}
          role="progressbar"
          aria-valuenow={usagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('tokens.usagePercentLabel', { percent: usagePercent })}
        ></div>
      </div>
      
      {/* 사용량 정보 */}
      <div className="flex justify-between text-xs sm:text-sm">
        <div>
          <div className="font-medium">{t('tokens.used')}</div>
          <div className={`${usageLevel.textColor} mt-0.5 font-mono`}>{formatNumber(totalTokensUsed)}</div>
          <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">{totalSpent}</div>
        </div>
        
        <div className="text-right">
          <div className="font-medium">{t('tokens.remaining')}</div>
          <div className={`${usageLevel.textColor} mt-0.5 font-mono`}>{formatNumber(remainingTokens)}</div>
          <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">{quota}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenUsage;
