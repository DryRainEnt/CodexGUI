import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useApiKeyStore from '../store/apiKeyStore';
import { validateApiKey } from '../api/endpoints';

const Launch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiKey, isValidated, setApiKey, setValidated } = useApiKeyStore();
  
  const [inputApiKey, setInputApiKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if API key is already validated, redirect to projects
  useEffect(() => {
    if (isValidated && apiKey) {
      navigate('/projects');
    }
  }, [isValidated, apiKey, navigate]);
  
  const handleValidate = async () => {
    if (!inputApiKey.trim()) {
      setError(t('launch.invalidKeyError'));
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      const result = await validateApiKey(inputApiKey);
      setApiKey(inputApiKey);
      setValidated(true);
      navigate('/projects');
    } catch (err) {
      console.error('API key validation error:', err);
      setError(t('launch.invalidKeyError'));
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-primary-600 dark:text-primary-400 mb-2">
          {t('launch.title')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {t('launch.subtitle')}
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('launch.apiKeyInput')}
            </label>
            <input
              id="apiKey"
              type="password"
              className="input w-full"
              placeholder={t('launch.apiKeyPlaceholder')}
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isValidating}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            className="btn btn-primary w-full"
            onClick={handleValidate}
            disabled={isValidating}
          >
            {isValidating ? t('launch.validatingMessage') : t('launch.validateButton')}
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {t('app.version')}
      </div>
    </div>
  );
};

export default Launch;
