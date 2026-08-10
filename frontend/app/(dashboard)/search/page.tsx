'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UploadCloud, Search as SearchIcon, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { SearchMatch } from '@/types';
import Link from 'next/link';

export default function SearchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchMatch[] | null>(null);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleSearch = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await api.search.searchByReference(formData);
      setResults(data.matches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Visual Search</h1>
        <p className="text-text-secondary mt-2 max-w-lg mx-auto">
          Upload an inspiration photo to find similar items in your own closet.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="p-6 border-dashed border-2">
          {!preview ? (
            <div 
              className="aspect-[4/5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-black/5 rounded-lg transition-colors"
              onClick={() => document.getElementById('search-upload')?.click()}
            >
              <UploadCloud className="w-12 h-12 text-text-secondary mb-4" />
              <h3 className="font-medium mb-1">Upload Inspiration</h3>
              <p className="text-sm text-text-secondary">Tap or drag photo here</p>
              <input 
                id="search-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-[4/5] relative rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Reference" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setFile(null); setPreview(null); setResults(null); }}>
                  Clear
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSearch} loading={loading}>
                  <SearchIcon className="w-4 h-4" /> Search Closet
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div>
          {loading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-surface border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full border-4 border-border border-t-accent animate-spin mb-4" />
              <p className="text-text-secondary font-medium animate-pulse">Analyzing image and matching...</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="text-success w-5 h-5" /> 
                {results.length > 0 ? 'Matches Found' : 'No matches found'}
              </h3>
              
              {results.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {results.map((match, i) => (
                    <Card key={i} hoverable className="overflow-hidden group">
                      <div className="aspect-square relative bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {match.item && <img src={match.item.imageUrl} alt="Match" className="w-full h-full object-cover" />}
                        <div className="absolute top-2 right-2">
                          <Badge variant={match.score > 0.8 ? 'success' : 'default'} className="bg-white/90 backdrop-blur shadow-sm">
                            {Math.round(match.score * 100)}% Match
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-surface border border-border rounded-xl">
                  <p className="text-text-secondary mb-4">You don't have anything quite like this yet.</p>
                  <Link href="/shop">
                    <Button variant="secondary" className="w-full gap-2">
                      Shop what's missing <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl p-8 text-center">
              <SearchIcon className="w-12 h-12 text-text-secondary/50 mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">Results will appear here</h3>
              <p className="text-sm text-text-secondary/70">Upload a photo and click search to find matching items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
