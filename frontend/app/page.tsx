import React from 'react';
import Link from 'next/link';
import { Shirt, Search, Palette, MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-4 py-20 md:py-32 max-w-5xl mx-auto text-center animate-slideUp">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-text-primary leading-tight">
            Your Closet,<br className="hidden md:block" />
            <span className="text-text-secondary font-light">Reimagined.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            A minimalist, AI-powered wardrobe manager that helps you catalog your clothes, discover new outfits, and redefine your style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent-hover transition-colors flex items-center justify-center"
            >
              Get Started for Free
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 border border-border bg-transparent text-text-primary rounded-full font-medium hover:bg-surface transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-20 bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="p-6 rounded-2xl bg-background border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-highlight/20 flex items-center justify-center mb-6">
                  <Shirt className="w-6 h-6 text-highlight" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Cataloging</h3>
                <p className="text-text-secondary leading-relaxed">
                  Upload photos of your clothes. Our AI automatically tags category, color, and patterns.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Search</h3>
                <p className="text-text-secondary leading-relaxed">
                  Find matches instantly. See an outfit you like? Upload it and see what you own that matches.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-6">
                  <Palette className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Outfit Builder</h3>
                <p className="text-text-secondary leading-relaxed">
                  Mix and match items on an infinite canvas. Get real-time AI compatibility scores.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-background border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Stylist</h3>
                <p className="text-text-secondary leading-relaxed">
                  Chat with your personal stylist. Get tailored advice based on your exact wardrobe.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-text-secondary text-sm">
        <p>Built with ♥ for fashion lovers</p>
      </footer>
    </div>
  );
}
