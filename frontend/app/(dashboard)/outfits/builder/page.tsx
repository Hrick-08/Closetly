'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useCloset } from '@/hooks/useCloset';
import { ClosetItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

// Drag components
const DraggableItem = ({ item }: { item: ClosetItem }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${item._id}`,
    data: item
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`aspect-square rounded-lg border border-border overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover pointer-events-none" />
    </div>
  );
};

const DroppableZone = ({ id, label, item, onRemove }: { id: string, label: string, item: ClosetItem | null, onRemove: () => void }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`relative w-full aspect-square md:aspect-auto md:h-48 rounded-xl border-2 transition-colors flex flex-col items-center justify-center overflow-hidden
        ${isOver ? 'border-accent bg-accent/5' : 'border-dashed border-border bg-surface'}
        ${item ? 'border-solid border-border' : ''}
      `}
    >
      {item ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={label} className="w-full h-full object-cover" />
          <button 
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-error shadow-sm hover:bg-error hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      )}
    </div>
  );
};

export default function OutfitBuilderPage() {
  const { items, fetchItems } = useCloset();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Slots
  const [slots, setSlots] = useState<{ [key: string]: ClosetItem | null }>({
    top: null,
    bottom: null,
    footwear: null,
    accessory: null
  });

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Compute dummy score when slots change
  useEffect(() => {
    const filledCount = Object.values(slots).filter(Boolean).length;
    if (filledCount >= 2) {
      // Mock score logic
      setScore(0.75 + (Math.random() * 0.2));
    } else {
      setScore(null);
    }
  }, [slots]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over) {
      const itemData = active.data.current;
      setSlots(prev => ({
        ...prev,
        [over.id]: itemData
      }));
    }
  };

  const removeItem = (slotId: string) => {
    setSlots(prev => ({ ...prev, [slotId]: null }));
  };

  const handleSave = async () => {
    const itemIds = Object.values(slots).filter(Boolean).map(item => item!._id);
    if (itemIds.length < 2) {
      addToast('warning', 'Add at least 2 items to save an outfit.');
      return;
    }
    if (!name.trim()) {
      addToast('warning', 'Please name your outfit.');
      return;
    }
    
    setSaving(true);
    try {
      await api.outfits.createOutfit(name, itemIds);
      addToast('success', 'Outfit saved successfully!');
      router.push('/outfits');
    } catch (err) {
      addToast('error', 'Failed to save outfit');
    } finally {
      setSaving(false);
    }
  };

  const activeItemData = items.find(i => `item-${i._id}` === activeId);
  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fadeIn">
      {/* LEFT PANEL - Items */}
      <div className="w-full md:w-80 flex flex-col bg-surface border border-border rounded-xl overflow-hidden shrink-0 h-1/2 md:h-full">
        <div className="p-4 border-b border-border bg-background">
          <Link href="/outfits" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Outfits
          </Link>
          <h2 className="text-lg font-semibold">Your Closet</h2>
          <div className="flex overflow-x-auto mt-3 pb-1 gap-2 hide-scrollbar">
            {['All', 'Tops', 'Bottoms', 'Dresses', 'Footwear', 'Outerwear'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-accent text-white' : 'bg-black/5 text-text-secondary hover:bg-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <DraggableItem key={item._id} item={item} />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-2 text-center py-10 text-text-secondary text-sm">
                No items found.
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Canvas */}
          <div className="fixed md:static inset-x-0 bottom-0 top-1/2 md:top-auto md:h-full md:flex-1 bg-background md:bg-transparent p-4 md:p-0 flex flex-col overflow-y-auto border-t md:border-none border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none z-10">
            <div className="bg-surface md:border border-border rounded-xl p-4 md:p-6 flex-1 flex flex-col max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Build Outfit</h2>
                {score && (
                  <Badge variant={score > 0.7 ? 'success' : 'warning'} className="text-sm px-3 py-1">
                    {Math.round(score * 100)}% Match
                  </Badge>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4 max-w-sm mx-auto w-full py-4">
                <DroppableZone id="top" label="Top / Outerwear" item={slots.top} onRemove={() => removeItem('top')} />
                <DroppableZone id="bottom" label="Bottom / Dress" item={slots.bottom} onRemove={() => removeItem('bottom')} />
                <div className="grid grid-cols-2 gap-4">
                  <DroppableZone id="footwear" label="Footwear" item={slots.footwear} onRemove={() => removeItem('footwear')} />
                  <DroppableZone id="accessory" label="Accessory" item={slots.accessory} onRemove={() => removeItem('accessory')} />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border space-y-4">
                <Input 
                  placeholder="Name your outfit (e.g. Summer Date Night)" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <Button className="w-full gap-2" onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" /> Save Outfit
                </Button>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeId && activeItemData ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden shadow-xl border-2 border-accent rotate-6 opacity-90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeItemData.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
