
"use client";

import * as React from 'react';
import PasswordScreen from '@/components/auth/password-screen';
import MainApp from '@/components/timewise/main-app';

export default function Home() {
  // Start with isAuthenticated as false to ensure the server-rendered version is consistent.
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  // Use a loading state to prevent showing the wrong component while checking auth status.
  const [isLoading, setIsLoading] = React.useState(true);

  // This effect runs only on the client-side after initial render.
  React.useEffect(() => {
    try {
      // Check for the authentication status in sessionStorage.
      const authStatus = sessionStorage.getItem('timewise-auth') === 'true';
      setIsAuthenticated(authStatus);
    } catch (error) {
      // If sessionStorage is not available or fails, default to not authenticated.
      console.warn('Could not read from sessionStorage:', error);
      setIsAuthenticated(false);
    } finally {
      // Once the check is complete, set loading to false.
      setIsLoading(false);
    }
  }, []); // The empty dependency array ensures this runs only once on mount.

  const handleUnlock = () => {
    try {
      sessionStorage.setItem('timewise-auth', 'true');
    } catch (error) {
      console.warn('Could not write to sessionStorage:', error);
    }
    setIsAuthenticated(true);
  };

  // During the initial client render before the effect runs,
  // we show a loading state to prevent any content flash or hydration mismatches.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {/* Blank loading state prevents server-client mismatch errors */}
      </div>
    );
  }

  return (
    <div className="app-container h-dvh overflow-hidden flex flex-col">
      {isAuthenticated ? <MainApp /> : <PasswordScreen onUnlock={handleUnlock} />}
    </div>
  );
}
