export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ClosetItem {
  _id: string;
  userId: string;
  imageUrl: string;
  cloudinaryId?: string;
  category: string;
  color: string;
  pattern: string;
  tags: string[];
  embeddingId?: string;
  createdAt: string;
}

export interface Outfit {
  _id: string;
  userId: string;
  name: string;
  itemIds: string[];
  items?: ClosetItem[];
  compatibilityScore: number;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ShopProduct {
  productUrl: string;
  imageUrl: string;
  title: string;
  price: number;
  source: string;
  similarityScore: number;
}

export interface SearchMatch {
  closetItemId: string;
  score: number;
  item?: ClosetItem;
}
