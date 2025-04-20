import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../api/endpoints';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  addProject: (projectData: ProjectCreate) => Promise<Project>;
  updateProject: (id: string, projectData: ProjectUpdate) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      
      fetchProjects: async () => {
        try {
          set({ loading: true, error: null });
          
          // API 호출 전에 프로젝트를 가져오는 함수가 구현되어 있는지 확인
          if (typeof getProjects !== 'function') {
            // API 구현 전 목업 데이터 사용
            set({ 
              projects: [
                {
                  id: '1',
                  name: 'Sample Project 1',
                  path: '/path/to/project1',
                  description: 'A sample project for testing',
                  created_at: '2023-02-20T10:00:00Z',
                  updated_at: '2023-02-21T15:30:00Z',
                  is_favorite: true,
                  codex_settings: {
                    approval_mode: 'suggest'
                  }
                },
                {
                  id: '2',
                  name: 'Sample Project 2',
                  path: '/path/to/project2',
                  description: 'Another sample project',
                  created_at: '2023-02-18T09:00:00Z',
                  updated_at: '2023-02-19T11:45:00Z',
                  is_favorite: false,
                  codex_settings: {
                    approval_mode: 'suggest'
                  }
                }
              ],
              loading: false
            });
            return;
          }
          
          const data = await getProjects();
          set({ projects: data, loading: false });
        } catch (err: any) {
          console.error('Failed to fetch projects:', err);
          set({ 
            error: err.message || 'Failed to fetch projects',
            loading: false
          });
        }
      },
      
      fetchProject: async (id: string) => {
        try {
          set({ loading: true, error: null });
          
          // API 구현 전 목업 데이터 사용
          if (typeof getProject !== 'function') {
            const mockProject = get().projects.find(p => p.id === id) || {
              id,
              name: `Project ${id}`,
              path: `/path/to/project${id}`,
              description: 'Project details',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_favorite: false,
              codex_settings: {
                approval_mode: 'suggest'
              }
            };
            
            set({ currentProject: mockProject, loading: false });
            return;
          }
          
          const project = await getProject(id);
          set({ currentProject: project, loading: false });
        } catch (err: any) {
          console.error(`Failed to fetch project ${id}:`, err);
          set({ 
            error: err.message || 'Failed to fetch project',
            loading: false
          });
        }
      },
      
      addProject: async (projectData: ProjectCreate) => {
        try {
          set({ loading: true, error: null });
          
          // API 구현 전 목업 데이터 추가
          if (typeof createProject !== 'function') {
            const newProject: Project = {
              id: `temp-${Date.now()}`,
              name: projectData.name,
              path: projectData.path,
              description: projectData.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_favorite: false,
              codex_settings: {
                approval_mode: 'suggest'
              }
            };
            
            set(state => ({ 
              projects: [...state.projects, newProject],
              loading: false
            }));
            
            return newProject;
          }
          
          const newProject = await createProject(projectData);
          set(state => ({ 
            projects: [...state.projects, newProject],
            loading: false
          }));
          
          return newProject;
        } catch (err: any) {
          console.error('Failed to add project:', err);
          set({ 
            error: err.message || 'Failed to add project',
            loading: false
          });
          throw err;
        }
      },
      
      updateProject: async (id: string, projectData: ProjectUpdate) => {
        try {
          set({ loading: true, error: null });
          
          // API 구현 전 목업 데이터 업데이트
          if (typeof updateProject !== 'function') {
            set(state => ({
              projects: state.projects.map(project => 
                project.id === id 
                  ? { ...project, ...projectData, updated_at: new Date().toISOString() }
                  : project
              ),
              currentProject: state.currentProject?.id === id
                ? { ...state.currentProject, ...projectData, updated_at: new Date().toISOString() }
                : state.currentProject,
              loading: false
            }));
            return;
          }
          
          const updatedProject = await updateProject(id, projectData);
          set(state => ({
            projects: state.projects.map(project => 
              project.id === id ? updatedProject : project
            ),
            currentProject: state.currentProject?.id === id
              ? updatedProject
              : state.currentProject,
            loading: false
          }));
        } catch (err: any) {
          console.error(`Failed to update project ${id}:`, err);
          set({ 
            error: err.message || 'Failed to update project',
            loading: false
          });
          throw err;
        }
      },
      
      removeProject: async (id: string) => {
        try {
          set({ loading: true, error: null });
          
          // API 구현 전 목업 데이터 삭제
          if (typeof deleteProject !== 'function') {
            set(state => ({
              projects: state.projects.filter(project => project.id !== id),
              currentProject: state.currentProject?.id === id ? null : state.currentProject,
              loading: false
            }));
            return;
          }
          
          await deleteProject(id);
          set(state => ({
            projects: state.projects.filter(project => project.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            loading: false
          }));
        } catch (err: any) {
          console.error(`Failed to remove project ${id}:`, err);
          set({ 
            error: err.message || 'Failed to remove project',
            loading: false
          });
          throw err;
        }
      },
      
      toggleFavorite: async (id: string) => {
        try {
          const project = get().projects.find(p => p.id === id);
          if (!project) throw new Error('Project not found');
          
          const updatedFavorite = !project.is_favorite;
          
          // Optimistic update
          set(state => ({
            projects: state.projects.map(p => 
              p.id === id ? { ...p, is_favorite: updatedFavorite } : p
            )
          }));
          
          // API 업데이트
          await get().updateProject(id, { is_favorite: updatedFavorite });
        } catch (err: any) {
          console.error(`Failed to toggle favorite for project ${id}:`, err);
          // Revert optimistic update on error
          set(state => ({
            projects: state.projects.map(p => 
              p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
            ),
            error: err.message || 'Failed to update favorite status'
          }));
        }
      },
      
      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'codexgui-projects',
      partialize: (state) => ({
        // 로컬 스토리지에 저장할 상태만 선택
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
);

export default useProjectStore;
