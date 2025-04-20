import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Settings, PaintBrush, Folder, Plugins } from 'lucide-react';
import useApiKeyStore from '../store/apiKeyStore';
import useProjectStore from '../store/projectStore';
import useAvatarStore from '../store/avatarStore';
import useTheme from '../hooks/useTheme';
import AvatarEditor from '../components/AvatarEditor';
import ProjectCard from '../components/ProjectCard';
import ProjectCreateModal from '../components/ProjectCreateModal';
import { TokenUsage } from '../components/ui';
import { ProjectCreate } from '../types/project';
import { getTokenUsage } from '../api/endpoints';

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Stores
  const { apiKey, isValidated, remainingTokens } = useApiKeyStore();
  const { 
    projects, 
    loading, 
    error, 
    fetchProjects, 
    addProject, 
    removeProject, 
    toggleFavorite 
  } = useProjectStore();
  const { 
    avatar, 
    isEnabled, 
    fetchAvatar, 
    updateAvatar, 
    toggleEnabled 
  } = useAvatarStore();
  
  // Local state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<{
    totalTokensUsed: number;
    remainingTokens: number;
    totalSpent: string;
    quota: string;
    usagePercent: number;
  } | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState<string | null>(null);
  
  // Check if API key is validated
  useEffect(() => {
    if (!isValidated || !apiKey) {
      navigate('/launch');
    }
  }, [isValidated, apiKey, navigate]);
  
  // Fetch projects and avatar data
  useEffect(() => {
    fetchProjects();
    fetchAvatar();
  }, [fetchProjects, fetchAvatar]);
  
  // Fetch token usage
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!isValidated || !apiKey) return;
      
      setIsLoadingTokens(true);
      try {
        const usageInfo = await getTokenUsage();
        
        setTokenUsage({
          totalTokensUsed: usageInfo.total_tokens_used || 0,
          remainingTokens: usageInfo.remaining_tokens || remainingTokens || 0,
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
    };
    
    fetchTokenInfo();
  }, [isValidated, apiKey, remainingTokens, t]);
  
  // Handle project selection
  const handleSelectProject = (id: string) => {
    navigate(`/project/${id}`);
  };
  
  // Handle project deletion
  const handleDeleteProject = async (id: string) => {
    try {
      await removeProject(id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };
  
  // Handle creating a new project
  const handleCreateProject = async (projectData: ProjectCreate) => {
    try {
      const newProject = await addProject(projectData);
      setIsCreatingProject(false);
      
      // Automatically navigate to the new project
      navigate(`/project/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err; // Re-throw for the modal to handle
    }
  };
  
  // Sort projects: favorites first, then by last modified date
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header with token info */}
      <div className="h-8 flex justify-end items-center mb-2">
        {tokenUsage && (
          <TokenUsage
            totalTokensUsed={tokenUsage.totalTokensUsed}
            remainingTokens={tokenUsage.remainingTokens}
            totalSpent={tokenUsage.totalSpent}
            quota={tokenUsage.quota}
            usagePercent={tokenUsage.usagePercent}
            isLoading={isLoadingTokens}
            error={tokenLoadError}
            compact
          />
        )}
      </div>
      
      {/* Avatar section */}
      {isEnabled && avatar ? (
        <AvatarEditor
          avatar={avatar}
          onSave={updateAvatar}
          readOnly={false}
          showStatus={false}
        />
      ) : (
        <div className="flex items-center justify-between py-2 px-4 bg-white dark:bg-gray-800 rounded-md shadow-sm mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('avatar.disabled')}
          </span>
          <button 
            onClick={() => toggleEnabled()}
            className="btn btn-sm btn-primary"
          >
            {t('avatar.enable')}
          </button>
        </div>
      )}
      
      {/* Projects list */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4">
        <button
          className="w-full p-2 mb-2 text-left text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center"
          onClick={() => setIsCreatingProject(true)}
        >
          <Plus size={18} className="mr-2" />
          {t('projects.addNew')}
        </button>
        
        {loading ? (
          <div className="p-4 text-center">{t('common.loading')}</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : sortedProjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {t('projects.noProjects')}
          </div>
        ) : (
          sortedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={handleSelectProject}
              onDelete={handleDeleteProject}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
      
      {/* Footer with system buttons */}
      <div className="h-16 mt-2">
        <div className="grid grid-cols-4 gap-2 mb-2">
          <button 
            className="btn btn-outline text-sm flex items-center justify-center"
            aria-label={t('settings.apiSettings')}
          >
            <Settings size={16} className="mr-1" />
            {t('settings.apiSettings')}
          </button>
          <button 
            className="btn btn-outline text-sm flex items-center justify-center"
            onClick={toggleTheme}
            aria-label={t('settings.uiSettings')}
          >
            <PaintBrush size={16} className="mr-1" />
            {t('settings.uiSettings')}
          </button>
          <button 
            className="btn btn-outline text-sm flex items-center justify-center"
            aria-label={t('settings.plugins')}
          >
            <Plugins size={16} className="mr-1" />
            {t('settings.plugins')}
          </button>
          <button 
            className="btn btn-outline text-sm flex items-center justify-center"
            aria-label={t('settings.rootFolder')}
          >
            <Folder size={16} className="mr-1" />
            {t('settings.rootFolder')}
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          CodexGUI Web Edition v0.1.0
        </div>
      </div>
      
      {/* Project creation modal */}
      <ProjectCreateModal
        isOpen={isCreatingProject}
        onClose={() => setIsCreatingProject(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
