'use client';

import React, { useState } from 'react';
import { useCloset } from '@/hooks/useCloset';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, UploadCloud, CheckCircle, Shirt } from 'lucide-react';
import Image from 'next/image';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Bags', 'Accessories'];

export default function ClosetPage() {
  const { items, loading, fetchItems, uploadItem, deleteItem } = useCloset();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedResult, setUploadedResult] = useState<any>(null);
  const { addToast } = useToast();

  const handleFilterClick = (cat: string) => {
    setActiveFilter(cat);
    if (cat === 'All') {
      fetchItems();
    } else {
      fetchItems({ category: cat.toLowerCase() });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploadedResult(null);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      const res = await uploadItem(formData);
      setUploadedResult(res);
      addToast('success', 'Item added to your closet!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to upload item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        addToast('success', 'Item deleted');
      } catch (err) {
        addToast('error', 'Failed to delete item');
      }
    }
  };

  const resetUpload = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadedResult(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Closet</h1>
          <p className="text-text-secondary mt-1">Manage and catalog your wardrobe.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleFilterClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === cat 
                ? 'bg-accent text-white' 
                : 'bg-surface border border-border text-text-secondary hover:border-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="card" className="aspect-square h-auto" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Your closet is empty</h3>
          <p className="text-text-secondary mb-6">Start by adding some items to your wardrobe!</p>
          <Button onClick={() => setIsModalOpen(true)}>Add your first item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(item => (
            <Card key={item._id} hoverable className="group relative">
              <div className="aspect-square relative overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.imageUrl} 
                  alt={item.category}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="absolute top-2 right-2 p-2 bg-white/90 text-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Badge variant="default" className="bg-white/90 backdrop-blur-sm border border-border/50 capitalize shadow-sm">
                    {item.category}
                  </Badge>
                  {item.color && (
                    <div 
                      className="w-6 h-6 rounded-full border border-border shadow-sm bg-white/90"
                      title={item.color}
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={resetUpload} title="Add New Item">
        {!uploadedResult ? (
          <div className="space-y-4">
            {!uploadPreview ? (
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-black/5 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="w-10 h-10 text-text-secondary mx-auto mb-4" />
                <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
                <p className="text-xs text-text-secondary mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-square relative rounded-xl overflow-hidden bg-black/5 border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => { setUploadFile(null); setUploadPreview(null); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleUpload} loading={uploading}>
                    Upload Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Item added successfully!</h3>
              <p className="text-sm text-text-secondary mb-4">Our AI automatically tagged your item.</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-sm px-3 py-1 capitalize border-success/30 text-success">
                  {uploadedResult.category}
                </Badge>
                {uploadedResult.color && (
                  <Badge variant="outline" className="text-sm px-3 py-1 capitalize">
                    Color: {uploadedResult.color}
                  </Badge>
                )}
                {uploadedResult.pattern && (
                  <Badge variant="outline" className="text-sm px-3 py-1 capitalize">
                    Pattern: {uploadedResult.pattern}
                  </Badge>
                )}
              </div>
            </div>
            <Button className="w-full" onClick={resetUpload}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
