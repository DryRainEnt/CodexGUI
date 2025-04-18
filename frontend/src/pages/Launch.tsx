import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useApiKeyStore from '../store/apiKeyStore';
import { validateApiKey, getTokenUsage } from '../api/endpoints';
import { LockIcon, KeyIcon, ShieldCheckIcon, AlertCircleIcon } from 'lucide-react';

const Launch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiKey, isValidated, setApiKey, setValidated, setRemainingTokens } = useApiKeyStore();
  
  const [inputApiKey, setInputApiKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingStage, setValidatingStage] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  
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
    
    if (!inputApiKey.startsWith('sk-') || inputApiKey.length < 20) {
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
          const remainingTokens = result.rate_limits.available_grants || 0;
          setRemainingTokens(remainingTokens);
        } else {
          // 정보가 없는 경우 별도로 가져오기 시도
          try {
            const usageInfo = await getTokenUsage();
            setRemainingTokens(usageInfo.remaining_tokens);
          } catch (usageErr) {
            console.warn('Could not fetch token usage:', usageErr);
          }
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
  }, [inputApiKey, t, setApiKey, setValidated, setRemainingTokens, navigate]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
            <LockIcon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {t('launch.title')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          {t('launch.subtitle')}
        </p>
        
        <div className="space-y-6">
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
              <div className="flex items-start mt-2">
                <AlertCircleIcon className="w-5 h-5 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
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
          >
            {isValidating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('launch.validatingMessage')}
              </div>
            ) : (
              t('launch.validateButton')
            )}
          </button>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
            <p>{t('launch.apiKeySecurityNote')}</p>
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
