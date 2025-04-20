import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ProjectCreate } from '../types/project';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectCreate) => Promise<void>;
  isSubmitting?: boolean;
}

const ProjectCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: ProjectCreateModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('projects.errors.nameRequired'));
      return;
    }
    
    if (!path.trim()) {
      setError(t('projects.errors.pathRequired'));
      return;
    }
    
    try {
      await onSubmit({
        name: name.trim(),
        path: path.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form on success
      setName('');
      setPath('');
      setDescription('');
      setError(null);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };
  
  const handleSelectDirectory = async () => {
    try {
      // In a full implementation, this would use the backend API to show a directory picker
      // For now, we'll just set a mock path
      const mockPath = '/Users/example/projects/new-project';
      setPath(mockPath);
    } catch (err: any) {
      setError(err.message || t('projects.errors.directorySelection'));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-fadeIn"
        role="dialog"
        aria-labelledby="project-create-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="project-create-title" className="text-xl font-semibold dark:text-white">
            {t('projects.createNew')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Project name */}
          <div className="mb-4">
            <label 
              htmlFor="project-name" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('projects.name')} *
            </label>
            <input
              ref={inputRef}
              id="project-name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('projects.namePlaceholder')}
              required
            />
          </div>
          
          {/* Project path */}
          <div className="mb-4">
            <label 
              htmlFor="project-path" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('projects.path')} *
            </label>
            <div className="flex">
              <input
                id="project-path"
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder={t('projects.pathPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={handleSelectDirectory}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-r-md flex items-center"
                aria-label={t('projects.browse')}
              >
                <FolderIcon size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('projects.pathDescription')}
            </p>
          </div>
          
          {/* Project description */}
          <div className="mb-4">
            <label 
              htmlFor="project-description" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('projects.description')}
            </label>
            <textarea
              id="project-description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('projects.descriptionPlaceholder')}
              rows={3}
            />
          </div>
          
          {/* Codex settings (collapsible section) */}
          <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <details>
              <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t('projects.codexSettings')}
                </span>
                <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
              </summary>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="approval-mode"
                      value="suggest"
                      defaultChecked
                      className="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('codex.approvalModes.suggest')}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="approval-mode"
                      value="auto-edit"
                      className="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('codex.approvalModes.autoEdit')}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="approval-mode"
                      value="full-auto"
                      className="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('codex.approvalModes.fullAuto')}</span>
                  </label>
                  
                  <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('codex.approvalDescription')}
                  </div>
                </div>
              </div>
            </details>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Form actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.creating')}
                </span>
              ) : (
                t('common.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
