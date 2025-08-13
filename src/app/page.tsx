'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('entries');

  return (
    <div className="app-container bg-background text-foreground">
      {/* Header */}
      <header className="p-4 bg-primary text-primary-foreground shadow-md">
        <h1 className="text-2xl font-bold text-center">TimeWise</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-4">
          <Button
            variant={activeTab === 'entries' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('entries')}
            className="rounded-r-none"
          >
            Entries
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('stats')}
            className="rounded-l-none"
          >
            Stats
          </Button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'entries' && (
            <div id="entries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your work entries will appear here.</p>
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === 'stats' && (
            <div id="stats" className="space-y-4">
               <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your work statistics will appear here.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button className="floating-action h-16 w-16 rounded-full shadow-lg haptic-feedback">
        <Plus size={32} />
      </Button>

      {/* Bottom Navigation Placeholder */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-primary/80 backdrop-blur-sm">
        {/* Navigation buttons can go here */}
      </footer>
    </div>
  );
}
