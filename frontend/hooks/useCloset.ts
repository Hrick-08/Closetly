'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClosetItem } from '@/types';
import { api } from '@/lib/api';

export const useCloset = () => {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (filters?: {category?: string, color?: string}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.closet.getItems(filters);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadItem = async (formData: FormData) => {
    try {
      const newItem = await api.closet.uploadItem(formData);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      throw new Error(err.message || 'Upload failed');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.closet.deleteItem(id);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Delete failed');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, fetchItems, uploadItem, deleteItem };
};
