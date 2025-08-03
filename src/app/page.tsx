"use client";

import * as React from 'react';
import PasswordScreen from '@/components/auth/password-screen';
import MainApp from '@/components/timewise/main-app';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    try {
      const authStatus = sessionStorage.getItem('timewise-auth') === 'true';
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.warn('Could not read from sessionStorage:', error);
      setIsAuthenticated(false);
    }
  }, []);

  const handleUnlock = () => {
    try {
      sessionStorage.setItem('timewise-auth', 'true');
    } catch (error) {
      console.warn('Could not write to sessionStorage:', error);
    }
    setIsAuthenticated(true);
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {/* Render a loading/blank state on the server to avoid hydration errors */}
      </div>
    );
  }

  return (
    <div className="app-container h-dvh overflow-hidden flex flex-col">
      {isAuthenticated ? <MainApp /> : <PasswordScreen onUnlock={handleUnlock} />}
    </div>
  );
}
