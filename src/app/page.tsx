"use client";

import * as React from 'react';
import PasswordScreen from '@/components/auth/password-screen';
import MainApp from '@/components/timewise/main-app';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // This code now runs only on the client, after the component has mounted.
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

  // Display a loading state until authentication status is determined from sessionStorage
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {/* You can add a loading spinner here */}
      </div>
    );
  }

  return (
    <div className="app-container h-dvh overflow-hidden flex flex-col">
      {isAuthenticated ? <MainApp /> : <PasswordScreen onUnlock={handleUnlock} />}
    </div>
  );
}
