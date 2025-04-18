import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useApiKeyStore from '../store/apiKeyStore';
// 필요한 함수만 유지
// import { getProjects, deleteProject } from '../api/endpoints';

// Placeholder for avatar component
const Avatar = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Codex Assistant');
  const [persona, setPersona] = useState('I am a helpful coding assistant.');
  
  return (
    <div className="flex items-start p-2">
      <div className="h-36 w-36 bg-gray-200 dark:bg-gray-700 rounded-md mr-4 flex items-center justify-center">
        <span className="text-4xl">🤖</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-semibold flex-1">
            {isEditing ? (
              <input
                type="text"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              name
            )}
          </h2>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  className="btn btn-primary text-sm"
                  onClick={() => setIsEditing(false)}
                >
                  {t('common.save')}
                </button>
                <button
                  className="btn btn-outline text-sm"
                  onClick={() => setIsEditing(false)}
                >
                  {t('common.cancel')}
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline text-sm"
                onClick={() => setIsEditing(true)}
              >
                {t('common.edit')}
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <textarea
            className="input w-full h-20"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder={t('avatar.personaPlaceholder')}
          />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">{persona}</p>
        )}
      </div>
    </div>
  );
};

// Project card component
interface ProjectCardProps {
  id: string;
  name: string;
  lastModified: string;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const ProjectCard = ({
  id,
  name,
  lastModified,
  isFavorite,
  onSelect,
  onDelete,
  onToggleFavorite
}: ProjectCardProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  return (
    <div className="relative">
      {isDeleting ? (
        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md mb-2">
          <p className="text-sm">{t('projects.deleteConfirm')}</p>
          <div className="flex justify-end mt-2 space-x-2">
            <button
              className="btn btn-outline text-xs"
              onClick={() => setIsDeleting(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="btn bg-red-600 hover:bg-red-700 text-white text-xs"
              onClick={() => {
                setIsDeleting(false);
                onDelete(id);
              }}
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="p-3 bg-white dark:bg-gray-800 rounded-md shadow mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => onSelect(id)}
        >
          <div className="flex items-center">
            <h3 className="text-md font-medium flex-1">{name}</h3>
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
            >
              {isFavorite ? '★' : '☆'}
            </button>
            <button
              className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
            >
              🗑️
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('projects.lastModified')}: {lastModified}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Projects component
const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiKey, isValidated } = useApiKeyStore();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if API key is validated
  useEffect(() => {
    if (!isValidated || !apiKey) {
      navigate('/launch');
    }
  }, [isValidated, apiKey, navigate]);
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready
        // const data = await getProjects();
        // setProjects(data);
        
        // Mock data for now
        setProjects([
          {
            id: '1',
            name: 'Sample Project 1',
            path: '/path/to/project1',
            description: 'A sample project for testing',
            created_at: '2023-02-20T10:00:00Z',
            updated_at: '2023-02-21T15:30:00Z',
            is_favorite: true
          },
          {
            id: '2',
            name: 'Sample Project 2',
            path: '/path/to/project2',
            description: 'Another sample project',
            created_at: '2023-02-18T09:00:00Z',
            updated_at: '2023-02-19T11:45:00Z',
            is_favorite: false
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [t]);
  
  const handleSelectProject = (id: string) => {
    navigate(`/project/${id}`);
  };
  
  const handleDeleteProject = async (id: string) => {
    try {
      // Uncomment when API is ready
      // await deleteProject(id);
      // Optimistic update
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(t('common.error'));
    }
  };
  
  const handleToggleFavorite = async (id: string) => {
    try {
      // Optimistic update
      setProjects(
        projects.map(project =>
          project.id === id
            ? { ...project, is_favorite: !project.is_favorite }
            : project
        )
      );
      
      // Backend update would go here
      // await updateProject(id, { is_favorite: !projectToUpdate.is_favorite });
    } catch (err) {
      console.error('Failed to update project:', err);
      setError(t('common.error'));
    }
  };
  
  const handleAddProject = () => {
    // This would open a modal or navigate to a create project page
    console.log('Add new project');
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
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Tokens: 1,000,000
        </span>
      </div>
      
      {/* Avatar section */}
      <Avatar />
      
      {/* Projects list */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4">
        <button
          className="w-full p-2 mb-2 text-left text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          onClick={handleAddProject}
        >
          + {t('projects.addNew')}
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
              id={project.id}
              name={project.name}
              lastModified={new Date(project.updated_at).toLocaleString()}
              isFavorite={project.is_favorite}
              onSelect={handleSelectProject}
              onDelete={handleDeleteProject}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}
      </div>
      
      {/* Footer with system buttons */}
      <div className="h-16 mt-2">
        <div className="flex space-x-2 mb-2">
          <button className="btn btn-outline flex-1 text-sm">
            API {t('settings.apiSettings')}
          </button>
          <button className="btn btn-outline flex-1 text-sm">
            UI {t('settings.uiSettings')}
          </button>
          <button className="btn btn-outline flex-1 text-sm">
            {t('settings.plugins')}
          </button>
          <button className="btn btn-outline flex-1 text-sm">
            {t('settings.rootFolder')}
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          CodexGUI Web Edition v0.1.0
        </div>
      </div>
    </div>
  );
};

export default Projects;
