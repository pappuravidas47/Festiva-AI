import axios from 'axios';
import {
  User,
  EventItem,
  EventPlan,
  BudgetSummary,
  BudgetItem,
  TaskItem,
  TaskMetrics,
  VendorItem,
  GuestItem,
  InspirationItem,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('festiva_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        !window.location.pathname.includes('/signin') &&
        !window.location.pathname.includes('/signup')
      ) {
        localStorage.removeItem('festiva_auth_token');
        localStorage.removeItem('festiva_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User; message: string }>(
      '/auth/register',
      data
    );
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User; message: string }>(
      '/auth/login',
      data
    );
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: { name?: string; phone?: string; avatarUrl?: string }) => {
    const res = await apiClient.patch<{ success: boolean; user: User; message: string }>(
      '/auth/profile',
      data
    );
    return res.data;
  },
};

// Event Service
export const eventService = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; events: EventItem[] }>('/events');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; event: EventItem; plan?: EventPlan }>(
      `/events/${id}`
    );
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; event: EventItem; message: string }>(
      '/events',
      data
    );
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; event: EventItem; message: string }>(
      `/events/${id}`,
      data
    );
    return res.data;
  },
  duplicate: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; event: EventItem; message: string }>(
      `/events/${id}/duplicate`
    );
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/events/${id}`);
    return res.data;
  },
};

// AI Service
export const aiService = {
  getStatus: async () => {
    const res = await apiClient.get<{
      success: boolean;
      geminiConfigured: boolean;
      model: string;
      message: string;
    }>('/ai/status');
    return res.data;
  },
  generatePlan: async (eventId: string) => {
    const res = await apiClient.post<{
      success: boolean;
      plan: EventPlan;
      isDemo: boolean;
      message: string;
    }>('/ai/generate-plan', { eventId });
    return res.data;
  },
  refinePlan: async (eventId: string, instruction: string) => {
    const res = await apiClient.post<{
      success: boolean;
      plan: EventPlan;
      isDemo: boolean;
      message: string;
    }>('/ai/refine-plan', { eventId, instruction });
    return res.data;
  },
  suggestIdeas: async (params: {
    eventType: string;
    budget?: number;
    guestCount?: number;
    city?: string;
    theme?: string;
    prompt: string;
  }) => {
    const res = await apiClient.post<{
      success: boolean;
      ideas: any[];
      isDemo: boolean;
    }>('/ai/suggest-ideas', params);
    return res.data;
  },
  regenerateSection: async (eventId: string, section: string, notes?: string) => {
    const res = await apiClient.post<{
      success: boolean;
      plan: EventPlan;
      message: string;
    }>('/ai/regenerate-section', { eventId, section, notes });
    return res.data;
  },
};

// Budget Service
export const budgetService = {
  getSummary: async (eventId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      summary: BudgetSummary;
      items: BudgetItem[];
    }>(`/budget/${eventId}`);
    return res.data;
  },
  addItem: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; item: BudgetItem; message: string }>(
      '/budget',
      data
    );
    return res.data;
  },
  updateItem: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; item: BudgetItem; message: string }>(
      `/budget/${id}`,
      data
    );
    return res.data;
  },
  deleteItem: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/budget/${id}`);
    return res.data;
  },
};

// Task & Timeline Service
export const taskService = {
  getTasks: async (eventId: string, filters?: { category?: string; priority?: string; status?: string; search?: string; sortBy?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      metrics: TaskMetrics;
      tasks: TaskItem[];
    }>(`/tasks/${eventId}`, { params: filters });
    return res.data;
  },
  createTask: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; task: TaskItem; message: string }>(
      '/tasks',
      data
    );
    return res.data;
  },
  updateTask: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; task: TaskItem; message: string }>(
      `/tasks/${id}`,
      data
    );
    return res.data;
  },
  toggleTask: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; task: TaskItem; message: string }>(
      `/tasks/${id}/toggle`
    );
    return res.data;
  },
  deleteTask: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return res.data;
  },
  autoGenerateMilestones: async (eventId: string) => {
    const res = await apiClient.post<{ success: boolean; tasks: TaskItem[]; message: string }>(
      `/tasks/${eventId}/auto-milestones`
    );
    return res.data;
  },
};

// Vendor Service
export const vendorService = {
  getVendors: async (eventId: string, filters?: { category?: string; status?: string; search?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      metrics: {
        totalVendors: number;
        bookedVendors: number;
        totalCommittedSpend: number;
        totalQuotedSpend: number;
      };
      vendors: VendorItem[];
    }>(`/vendors/${eventId}`, { params: filters });
    return res.data;
  },
  createVendor: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; vendor: VendorItem; message: string }>(
      '/vendors',
      data
    );
    return res.data;
  },
  updateVendor: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; vendor: VendorItem; message: string }>(
      `/vendors/${id}`,
      data
    );
    return res.data;
  },
  deleteVendor: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/vendors/${id}`);
    return res.data;
  },
  getQuestions: async (category: string, eventType?: string) => {
    const res = await apiClient.get<{ success: boolean; questions: string[] }>('/vendors/questions', {
      params: { category, eventType },
    });
    return res.data;
  },
};

// Guest Service
export const guestService = {
  getGuests: async (eventId: string, filters?: { rsvpStatus?: string; group?: string; search?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      metrics: {
        totalGuests: number;
        attendingGuests: number;
        pendingGuests: number;
        notAttendingGuests: number;
        totalHeadcountWithPlusOnes: number;
        expectedCapacity: number;
      };
      guests: GuestItem[];
    }>(`/guests/${eventId}`, { params: filters });
    return res.data;
  },
  createGuest: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; guest: GuestItem; message: string }>(
      '/guests',
      data
    );
    return res.data;
  },
  updateGuest: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; guest: GuestItem; message: string }>(
      `/guests/${id}`,
      data
    );
    return res.data;
  },
  deleteGuest: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/guests/${id}`);
    return res.data;
  },
  getInvitationDrafts: async (eventId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      drafts: { formal: string; warmCasual: string; shortWhatsApp: string };
    }>(`/guests/${eventId}/invitation-drafts`);
    return res.data;
  },
  exportCSV: async (eventId: string) => {
    const res = await apiClient.get(`/guests/${eventId}/export-csv`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

// Inspiration Service
export const inspirationService = {
  getAll: async (filters?: { eventType?: string; budgetTier?: string; style?: string }) => {
    const res = await apiClient.get<{ success: boolean; inspirations: InspirationItem[] }>(
      '/inspiration',
      { params: filters }
    );
    return res.data;
  },
  toggleFavorite: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; isFavorited: boolean; message: string }>(
      `/inspiration/${id}/favorite`
    );
    return res.data;
  },
  applyToEvent: async (inspirationId: string, eventId: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; event: EventItem }>(
      '/inspiration/apply-to-event',
      { inspirationId, eventId }
    );
    return res.data;
  },
};
