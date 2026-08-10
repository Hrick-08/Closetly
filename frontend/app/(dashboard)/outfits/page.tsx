'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Outfit } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const data = await api.outfits.getOutfits();
      setOutfits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this outfit?')) {
      try {
        await api.outfits.deleteOutfit(id);
        setOutfits(prev => prev.filter(o => o._id !== id));
        addToast('success', 'Outfit deleted');
      } catch (err) {
        addToast('error', 'Failed to delete outfit');
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Outfits</h1>
          <p className="text-text-secondary mt-1">Mix and match items to create the perfect look.</p>
        </div>
        <Link href="/outfits/builder">
          <Button className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Create Outfit
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 h-48 animate-pulse bg-border/20" />
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No outfits yet</h3>
          <p className="text-text-secondary mb-6">Unleash your creativity and build your first look.</p>
          <Link href="/outfits/builder">
            <Button>Start Building</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map(outfit => (
            <Card key={outfit._id} hoverable className="p-5 flex flex-col group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg line-clamp-1">{outfit.name}</h3>
                <button
                  onClick={() => handleDelete(outfit._id)}
                  className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2 overflow-hidden mb-5">
                {outfit.items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="w-16 h-16 rounded-md bg-black/5 overflow-hidden flex-shrink-0 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {(outfit.items?.length || 0) > 4 && (
                  <div className="w-16 h-16 rounded-md bg-surface border border-border flex items-center justify-center flex-shrink-0 text-sm font-medium text-text-secondary">
                    +{(outfit.items?.length || 0) - 4}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-text-secondary">Compatibility Score</span>
                <Badge variant={getScoreColor(outfit.compatibilityScore)}>
                  {Math.round(outfit.compatibilityScore * 100)}% Match
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
