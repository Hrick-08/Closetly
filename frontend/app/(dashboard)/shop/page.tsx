'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, ShoppingBag, Search } from 'lucide-react';
import { ShopProduct } from '@/types';

export default function ShopPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  // Mocking the behavior since visual search might pass a URL. For this standalone page:
  const mockSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts([
        {
          title: "Minimalist Wool Blend Coat",
          price: 189.99,
          source: "Everlane",
          imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=600",
          productUrl: "#",
          similarityScore: 0.92
        },
        {
          title: "Classic Cotton Crew Sweater",
          price: 65.00,
          source: "COS",
          imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
          productUrl: "#",
          similarityScore: 0.85
        },
        {
          title: "Straight Fit Denim Jeans",
          price: 98.00,
          source: "Levi's",
          imageUrl: "https://images.unsplash.com/photo-1542272604-780c8d5015ce?auto=format&fit=crop&q=80&w=600",
          productUrl: "#",
          similarityScore: 0.78
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Shop the Look</h1>
          <p className="text-text-secondary mt-1">Discover items to complete your wardrobe.</p>
        </div>
        <Button onClick={mockSearch} variant="secondary" className="gap-2 shrink-0">
          <Search className="w-4 h-4" /> Discover New Items
        </Button>
      </div>

      {products.length === 0 && !loading ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Ready to shop?</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Use the Visual Search tool with an inspiration image, and we'll recommend real products you can buy.
          </p>
          <Button onClick={mockSearch}>Show Recommendations</Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] bg-border/20 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-border/20 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-border/20 rounded w-1/2 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <Card key={i} hoverable className="overflow-hidden flex flex-col">
              <div className="aspect-[3/4] relative bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Badge variant="default" className="bg-white/90 backdrop-blur shadow-sm">
                    {product.source}
                  </Badge>
                  {product.similarityScore && (
                    <Badge variant="success" className="bg-white/90 backdrop-blur shadow-sm">
                      {Math.round(product.similarityScore * 100)}% Match
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-medium text-lg leading-tight mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-xl font-semibold mb-4 mt-auto">${product.price.toFixed(2)}</p>
                <a 
                  href={product.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="secondary" className="w-full gap-2">
                    View Product <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
