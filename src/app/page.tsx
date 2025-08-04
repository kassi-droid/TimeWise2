
"use client";

import * as React from 'react';
import PasswordScreen from '@/components/auth/password-screen';
import MainApp from '@/components/timewise/main-app';

export default function Home() {
  // Initialize state to `null` to represent the initial, undetermined state on the server.
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  // This effect runs only on the client-side after hydration.
  React.useEffect(() => {
    try {
      // Check for the authentication status in sessionStorage.
      const authStatus = sessionStorage.getItem('timewise-auth') === 'true';
      setIsAuthenticated(authStatus);
    } catch (error) {
      // If sessionStorage is not available or fails, default to not authenticated.
      console.warn('Could not read from sessionStorage:', error);
      setIsAuthenticated(false);
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

  // On the server, and during the initial client render before the effect runs,
  // `isAuthenticated` will be `null`. We render a loading state to prevent hydration mismatches.
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {/* This blank state prevents server-client mismatch errors */}
      </div>
    );
  }

  return (
    <div className="app-container h-dvh overflow-hidden flex flex-col">
      {isAuthenticated ? <MainApp /> : <PasswordScreen onUnlock={handleUnlock} />}
    </div>
  );
}
