import api from './client';

// API Key validation
export const validateApiKey = async (apiKey: string) => {
  try {
    const response = await api.post('/api/validate-key', { api_key: apiKey });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Token usage information
export const getTokenUsage = async () => {
  try {
    const response = await api.get('/api/token-usage');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Projects related endpoints
export const getProjects = async () => {
  try {
    const response = await api.get('/api/projects');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProject = async (projectData: any) => {
  try {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProject = async (projectId: string) => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (projectId: string, projectData: any) => {
  try {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Git operations
export const getGitStatus = async (projectId: string) => {
  try {
    const response = await api.get(`/api/git/${projectId}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const gitCommit = async (projectId: string, commitData: any) => {
  try {
    const response = await api.post(`/api/git/${projectId}/commit`, commitData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// File system operations
export const getFilesList = async (projectId: string, path: string) => {
  try {
    const response = await api.get(`/api/fs/${projectId}/list`, { params: { path } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const readFile = async (projectId: string, path: string) => {
  try {
    const response = await api.get(`/api/fs/${projectId}/read`, { params: { path } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const writeFile = async (projectId: string, path: string, content: string) => {
  try {
    const response = await api.post(`/api/fs/${projectId}/write`, { path, content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Chat logs
export const getChatLogs = async (projectId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/chat/${projectId}/logs`, { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendChatMessage = async (projectId: string, message: string) => {
  try {
    const response = await api.post(`/api/chat/${projectId}/send`, { message });
    return response.data;
  } catch (error) {
    throw error;
  }
};
