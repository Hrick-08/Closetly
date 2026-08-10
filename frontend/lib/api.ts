import axios from 'axios';
import { User, ClosetItem, Outfit, ChatMessage, ChatSession, ShopProduct, SearchMatch } from '@/types';

const apiInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

apiInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('closetly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('closetly_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (email: string, password: string): Promise<{token: string, user: User}> => 
      apiInstance.post('/auth/login', { email, password }).then(res => res.data),
    register: (name: string, email: string, password: string): Promise<{token: string, user: User}> => 
      apiInstance.post('/auth/register', { name, email, password }).then(res => res.data),
    getMe: (): Promise<User> => 
      apiInstance.get('/auth/me').then(res => res.data)
  },
  closet: {
    getItems: (filters?: {category?: string, color?: string}): Promise<ClosetItem[]> => 
      apiInstance.get('/closet', { params: filters }).then(res => res.data),
    uploadItem: (formData: FormData): Promise<ClosetItem> => 
      apiInstance.post('/closet', formData).then(res => res.data),
    deleteItem: (id: string): Promise<void> => 
      apiInstance.delete(`/closet/${id}`).then(res => res.data)
  },
  search: {
    searchByReference: (formData: FormData): Promise<{matches: SearchMatch[]}> => 
      apiInstance.post('/search', formData).then(res => res.data)
  },
  shop: {
    lookupProducts: (referenceImageUrl: string): Promise<{results: ShopProduct[]}> => 
      apiInstance.post('/shop/lookup', { referenceImageUrl }).then(res => res.data)
  },
  outfits: {
    getOutfits: (): Promise<Outfit[]> => 
      apiInstance.get('/outfits').then(res => res.data),
    createOutfit: (name: string, itemIds: string[]): Promise<Outfit> => 
      apiInstance.post('/outfits', { name, itemIds }).then(res => res.data),
    deleteOutfit: (id: string): Promise<void> => 
      apiInstance.delete(`/outfits/${id}`).then(res => res.data)
  },
  chat: {
    sendMessage: (message: string, sessionId?: string): Promise<{reply: string, sessionId: string, sourcesUsed: string[]}> => 
      apiInstance.post('/chat', { message, sessionId }).then(res => res.data),
    getSessions: (): Promise<any[]> => 
      apiInstance.get('/chat/sessions').then(res => res.data),
    getSession: (id: string): Promise<any> => 
      apiInstance.get(`/chat/sessions/${id}`).then(res => res.data)
  }
};
