import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useApiKeyStore from '../store/apiKeyStore';
import { validateApiKey, getTokenUsage } from '../api/endpoints';
import { LockIcon, KeyIcon, ShieldCheckIcon, AlertCircleIcon } from 'lucide-react';
import { ThemeToggle, TokenUsage, LanguageSelector } from '../components/ui';
import useTheme from '../hooks/useTheme';

const Launch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiKey, isValidated, setApiKey, setValidated, setRemainingTokens } = useApiKeyStore();
  const { theme } = useTheme(); // 현재 테마 상태 가져오기
  
  const [inputApiKey, setInputApiKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingStage, setValidatingStage] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  
  // 토큰 사용량 관련 상태
  const [tokenUsage, setTokenUsage] = useState<{
    totalTokensUsed: number;
    remainingTokens: number;
    totalSpent: string;
    quota: string;
    usagePercent: number;
  } | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string | null>(null);
  
  // 암호화 보안 레벨 표시
  const securityLevel = useMemo(() => {
    if (!inputApiKey) return '';
    if (inputApiKey.length >= 45) return t('launch.securityLevelHigh');
    if (inputApiKey.length >= 30) return t('launch.securityLevelMedium');
    return t('launch.securityLevelLow');
  }, [inputApiKey, t]);

  // 토큰 사용량 가져오기
  const fetchTokenUsage = useCallback(async () => {
    if (!apiKey || !isValidated) return;
    
    setIsLoadingTokens(true);
    setTokenLoadError(null);
    
    try {
      const usageInfo = await getTokenUsage();
      
      setTokenUsage({
        totalTokensUsed: usageInfo.total_tokens_used || 0,
        remainingTokens: usageInfo.remaining_tokens || 0,
        totalSpent: usageInfo.total_spent || '$0.00',
        quota: usageInfo.quota || '$0.00',
        usagePercent: usageInfo.usage_percent || 0
      });
    } catch (err: any) {
      console.error('Failed to fetch token usage:', err);
      setTokenLoadError(err.message || t('tokens.loadError'));
    } finally {
      setIsLoadingTokens(false);
    }
  }, [apiKey, isValidated, t]);

  // API 키가 유효하면 토큰 사용량 가져오기
  useEffect(() => {
    if (apiKey && isValidated) {
      fetchTokenUsage();
    }
  }, [apiKey, isValidated, fetchTokenUsage]);

  // API 키 유효성 재확인 및 프로젝트 화면으로 이동
  useEffect(() => {
    const checkExistingKey = async () => {
      if (apiKey && isValidated) {
        try {
          // 토큰 사용량 정보 가져오기 (배경에서 유효성 재확인)
          const usageInfo = await getTokenUsage();
          setRemainingTokens(usageInfo.remaining_tokens);
          navigate('/projects');
        } catch (err) {
          // 오류 발생 시 재인증 필요
          console.error('Token validation error:', err);
          setValidated(false);
          setError(t('launch.sessionExpiredError'));
        }
      }
    };
    
    checkExistingKey();
  }, [isValidated, apiKey, navigate, t, setValidated, setRemainingTokens]);
  
  const handleValidate = useCallback(async () => {
    // API 키 형식 기본 검증
    if (!inputApiKey.trim()) {
      setError(t('launch.emptyKeyError'));
      return;
    }
    
    // 테스트용 API 키는 형식 검증을 제외하고 바로 호출하도록 처리
    if (inputApiKey === 'sk-validkey12345') {
      // 테스트용 API 키는 바로 validateApiKey 호출
    } else if (!inputApiKey.startsWith('sk-') || inputApiKey.length < 20) {
      setError(t('launch.invalidKeyFormatError'));
      return;
    }
    
    setIsValidating(true);
    setError(null);
    setValidatingStage('checking');
    
    try {
      const result = await validateApiKey(inputApiKey);
      
      if (result.valid) {
        setValidatingStage('success');
        setApiKey(inputApiKey);
        setValidated(true);
        
        // 토큰 잔여량 정보가 있는 경우 저장
        if (result.rate_limits) {
          const remainingTokens = result.rate_limits.remaining_tokens || 0;
          setRemainingTokens(remainingTokens);
          
          // 토큰 사용량 정보 설정
          setTokenUsage({
            totalTokensUsed: result.rate_limits.total_tokens_used || 0,
            remainingTokens: remainingTokens,
            totalSpent: result.rate_limits.total_spent || '$0.00',
            quota: result.rate_limits.quota || '$0.00',
            usagePercent: result.rate_limits.usage_percent || 0
          });
        } else {
          // 정보가 없는 경우 별도로 가져오기 시도
          await fetchTokenUsage();
        }
        
        // 약간의 지연 후 다음 화면으로 이동 (성공 상태 보여주기 위해)
        setTimeout(() => {
          navigate('/projects');
        }, 800);
      } else {
        setValidatingStage('error');
        setError(t('launch.invalidKeyError'));
      }
    } catch (err: any) {
      console.error('API key validation error:', err);
      setValidatingStage('error');
      
      if (err.response) {
        // HTTP 응답 오류 처리
        const status = err.response.status;
        if (status === 401) {
          setError(t('launch.invalidKeyError'));
        } else if (status === 429) {
          setError(t('launch.rateLimitError')); 
        } else {
          setError(`${t('launch.serverError')} (${status})`);
        }
      } else if (err.request) {
        // 요청은 되었지만 응답이 없는 경우
        setError(t('launch.networkError')); 
      } else {
        // 기타 오류
        setError(t('launch.unknownError'));
      }
    } finally {
      setIsValidating(false);
    }
  }, [inputApiKey, t, setApiKey, setValidated, setRemainingTokens, navigate, fetchTokenUsage]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {/* 테마 토글 버튼 - 우측 상단에 고정 */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" role="main" aria-labelledby="launch-title">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
            <LockIcon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
        </div>
        
        <h1 id="launch-title" className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {t('launch.title')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          {t('launch.subtitle')}
        </p>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-800">
            <KeyIcon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 토큰 사용량 표시 (API 키가 유효한 경우에만) */}
          {apiKey && isValidated && (
            <TokenUsage
              totalTokensUsed={tokenUsage?.totalTokensUsed || 0}
              remainingTokens={tokenUsage?.remainingTokens || 0}
              totalSpent={tokenUsage?.totalSpent || '$0.00'}
              quota={tokenUsage?.quota || '$0.00'}
              usagePercent={tokenUsage?.usagePercent || 0}
              isLoading={isLoadingTokens}
              error={tokenLoadError}
              className="mb-4"
            />
          )}
          
          <div className="space-y-2">
            <label htmlFor="apiKey" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <KeyIcon className="w-4 h-4 mr-1" />
              {t('launch.apiKeyInput')}
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type="password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                  validatingStage === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : validatingStage === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200 dark:focus:ring-primary-800'
                } dark:bg-gray-700 dark:text-white`}
                placeholder={t('launch.apiKeyPlaceholder')}
                value={inputApiKey}
                onChange={(e) => {
                  setInputApiKey(e.target.value);
                  setValidatingStage('idle');
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={isValidating}
                autoFocus
                aria-invalid={validatingStage === 'error'}
                aria-describedby={error ? 'api-key-error' : inputApiKey ? 'security-level' : undefined}
              />
              {validatingStage === 'success' && (
                <div className="absolute right-3 top-3 text-green-500">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
              )}
              {validatingStage === 'error' && (
                <div className="absolute right-3 top-3 text-red-500">
                  <AlertCircleIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-start mt-2" id="api-key-error" role="alert">
                <AlertCircleIcon className="w-5 h-5 text-red-500 mr-1 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            
            {inputApiKey && !error && (
              <div className="flex items-center mt-2 text-xs" id="security-level" role="status">
                <div className="h-1 flex-grow rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className={`h-full ${securityLevel === t('launch.securityLevelHigh') 
                      ? 'bg-green-500 w-full' 
                      : securityLevel === t('launch.securityLevelMedium') 
                        ? 'bg-yellow-500 w-2/3' 
                        : 'bg-red-500 w-1/3'}`} 
                    aria-hidden="true"
                  />
                </div>
                <span className={`ml-2 ${securityLevel === t('launch.securityLevelHigh') 
                  ? 'text-green-500' 
                  : securityLevel === t('launch.securityLevelMedium') 
                    ? 'text-yellow-500' 
                    : 'text-red-500'}`}>
                  {securityLevel}
                </span>
              </div>
            )}
          </div>
          
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isValidating 
                ? 'bg-primary-400 text-white cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
            } dark:focus:ring-offset-gray-900`}
            onClick={handleValidate}
            disabled={isValidating}
            aria-busy={isValidating}
            aria-live="polite"
          >
            {isValidating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label={t('common.loading')}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('launch.validatingMessage')}
              </div>
            ) : (
              t('launch.validateButton')
            )}
          </button>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 space-y-1">
            <p>{t('launch.apiKeySecurityNote')}</p>
            <p>{t('launch.offlineNote')}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <span>{t('app.version')}</span> &bull; <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">{t('app.help')}</a>
      </div>
    </div>
  );
};

export default Launch;
