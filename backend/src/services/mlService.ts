import axios from 'axios';

const getMLClient = () => {
  const baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  return axios.create({ baseURL });
};

export const mlService = {
  getEmbeddingAndTags: async (imageBuffer: Buffer) => {
    try {
      const blob = new Blob([imageBuffer]);
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const response = await getMLClient().post('/embed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data as { embeddingId: string; suggestedTags: string[] };
    } catch (error: any) {
      console.error('getEmbeddingAndTags error:', error.message);
      throw new Error('Failed to get embedding and tags from ML service');
    }
  },

  searchSimilar: async (imageBuffer: Buffer, userId: string, topK?: number) => {
    try {
      const blob = new Blob([imageBuffer]);
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('userId', userId);
      if (topK) formData.append('topK', topK.toString());

      const response = await getMLClient().post('/search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data as { matches: { embeddingId: string; score: number }[] };
    } catch (error: any) {
      console.error('searchSimilar error:', error.message);
      throw new Error('Failed to search similar items via ML service');
    }
  },

  shopLookup: async (imageUrl: string) => {
    try {
      const response = await getMLClient().post('/shop-lookup', { imageUrl });
      return response.data as { results: any[] };
    } catch (error: any) {
      console.error('shopLookup error:', error.message);
      throw new Error('Failed to perform shop lookup via ML service');
    }
  },

  getCompatibilityScore: async (embeddingIds: string[]) => {
    try {
      const response = await getMLClient().post('/score', { embeddingIds });
      return response.data as { compatibilityScore: number };
    } catch (error: any) {
      console.error('getCompatibilityScore error:', error.message);
      throw new Error('Failed to get compatibility score via ML service');
    }
  },

  ragQuery: async (message: string, userId: string, sessionId?: string) => {
    try {
      const response = await getMLClient().post('/rag', { message, userId, sessionId });
      return response.data as { reply: string; sourcesUsed: string[] };
    } catch (error: any) {
      console.error('ragQuery error:', error.message);
      throw new Error('Failed to perform RAG query via ML service');
    }
  }
};
