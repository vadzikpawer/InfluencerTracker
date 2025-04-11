import axios from 'axios';
import { User, Project, Comment, Activity, WorkflowStage, Scenario, Material, Publication, Influencer } from './types';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface ProjectCreate extends Omit<Project, 'id' | 'created_at'> {}
interface ProjectUpdate extends Partial<Omit<Project, 'id' | 'created_at'>> {}

interface CommentCreate extends Omit<Comment, 'id' | 'created_at'> {}
interface CommentUpdate extends Partial<Omit<Comment, 'id' | 'created_at'>> {}

interface ActivityCreate extends Omit<Activity, 'id' | 'created_at'> {}
interface ActivityUpdate extends Partial<Omit<Activity, 'id' | 'created_at'>> {}

interface ScenarioCreate extends Omit<Scenario, 'id' | 'created_at'> {}
interface ScenarioUpdate extends Partial<Omit<Scenario, 'id' | 'created_at'>> {}

interface MaterialCreate extends Omit<Material, 'id' | 'created_at'> {}
interface MaterialUpdate extends Partial<Omit<Material, 'id' | 'created_at'>> {}

interface PublicationCreate extends Omit<Publication, 'id' | 'created_at'> {}
interface PublicationUpdate extends Partial<Omit<Publication, 'id' | 'created_at'>> {}

interface InfluencerCreate extends Omit<Influencer, 'id' | 'created_at'> {}
interface InfluencerUpdate extends Partial<Omit<Influencer, 'id' | 'created_at'>> {}

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  register: async (username: string, password: string, name: string, role: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', {
      username,
      password,
      name,
      role
    });
    return response.data;
  },
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};

export const projects = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects/');
    return response.data;
  },
  get: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },
  create: async (project: ProjectCreate): Promise<Project> => {
    const response = await api.post<Project>('/projects/', project);
    return response.data;
  },
  update: async (id: number, project: ProjectUpdate): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/projects/${id}`);
    return response;
  },
  updateWorkflowStage: async (id: number, workflowStage: WorkflowStage): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}/workflow-stage`, { workflow_stage: workflowStage });
    return response.data;
  }
};

export const comments = {
  list: async (projectId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/projects/${projectId}/comments`);
    return response.data;
  },
  create: async (projectId: number, comment: CommentCreate): Promise<Comment> => {
    const response = await api.post<Comment>(`/projects/${projectId}/comments`, comment);
    return response.data;
  },
  update: async (projectId: number, commentId: number, comment: CommentUpdate): Promise<Comment> => {
    const response = await api.put<Comment>(`/projects/${projectId}/comments/${commentId}`, comment);
    return response.data;
  },
  delete: async (projectId: number, commentId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/comments/${commentId}`);
  }
};

export const activities = {
  list: async (projectId: number): Promise<Activity[]> => {
    const response = await api.get<Activity[]>(`/projects/${projectId}/activities`);
    return response.data;
  },
  create: async (projectId: number, activity: ActivityCreate): Promise<Activity> => {
    const response = await api.post<Activity>(`/projects/${projectId}/activities`, activity);
    return response.data;
  },
  update: async (projectId: number, activityId: number, activity: ActivityUpdate): Promise<Activity> => {
    const response = await api.put<Activity>(`/projects/${projectId}/activities/${activityId}`, activity);
    return response.data;
  },
  delete: async (projectId: number, activityId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/activities/${activityId}`);
  }
};

export const scenarios = {
  list: async (projectId: number): Promise<Scenario[]> => {
    const response = await api.get<Scenario[]>(`/projects/${projectId}/scenarios`);
    return response.data;
  },
  create: async (projectId: number, scenario: ScenarioCreate): Promise<Scenario> => {
    const response = await api.post<Scenario>(`/projects/${projectId}/scenarios`, scenario);
    return response.data;
  },
  update: async (projectId: number, scenarioId: number, scenario: ScenarioUpdate): Promise<Scenario> => {
    const response = await api.put<Scenario>(`/projects/${projectId}/scenarios/${scenarioId}`, scenario);
    return response.data;
  },
  delete: async (projectId: number, scenarioId: number) => {
    const response = await api.delete(`/projects/${projectId}/scenarios/${scenarioId}`);
    return response;
  }
};

export const materials = {
  list: async (projectId: number): Promise<Material[]> => {
    const response = await api.get<Material[]>(`/projects/${projectId}/materials`);
    return response.data;
  },
  create: async (projectId: number, material: MaterialCreate): Promise<Material> => {
    const response = await api.post<Material>(`/projects/${projectId}/materials`, material);
    return response.data;
  },
  update: async (projectId: number, materialId: number, material: MaterialUpdate): Promise<Material> => {
    const response = await api.put<Material>(`/projects/${projectId}/materials/${materialId}`, material);
    return response.data;
  },
  delete: async (projectId: number, materialId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/materials/${materialId}`);
  }
};

export const publications = {
  list: async (projectId: number): Promise<Publication[]> => {
    const response = await api.get<Publication[]>(`/projects/${projectId}/publications`);
    return response.data;
  },
  create: async (projectId: number, publication: PublicationCreate): Promise<Publication> => {
    const response = await api.post<Publication>(`/projects/${projectId}/publications`, publication);
    return response.data;
  },
  update: async (projectId: number, publicationId: number, publication: PublicationUpdate): Promise<Publication> => {
    const response = await api.put<Publication>(`/projects/${projectId}/publications/${publicationId}`, publication);
    return response.data;
  },
  delete: async (projectId: number, publicationId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/publications/${publicationId}`);
  }
};

export const influencers = {
  list: async (projectId: number): Promise<Influencer[]> => {
    const response = await api.get<Influencer[]>(`/projects/${projectId}/influencers`);
    return response.data;
  },
  create: async (projectId: number, influencer: InfluencerCreate): Promise<Influencer> => {
    const response = await api.post<Influencer>(`/projects/${projectId}/influencers`, influencer);
    return response.data;
  },
  update: async (projectId: number, influencerId: number, influencer: InfluencerUpdate): Promise<Influencer> => {
    const response = await api.put<Influencer>(`/projects/${projectId}/influencers/${influencerId}`, influencer);
    return response.data;
  },
  delete: async (projectId: number, influencerId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/influencers/${influencerId}`);
  }
};

export default api; 