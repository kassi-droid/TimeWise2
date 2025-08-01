"use client";

import * as React from 'react';
import PasswordScreen from '@/components/auth/password-screen';
import MainApp from '@/components/timewise/main-app';

export default function Home() {
  // Default to null to indicate that we haven't checked the auth status yet.
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    try {
      const authStatus = sessionStorage.getItem('timewise-auth') === 'true';
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.warn('Could not read from sessionStorage:', error);
      // Ensure we are in a known state if sessionStorage fails
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

  // While isAuthenticated is null, we are still loading/checking the client-side session.
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {/* You can replace this with a more sophisticated loading spinner */}
      </div>
    );
  }

  return (
    <div className="app-container h-dvh overflow-hidden flex flex-col">
      {isAuthenticated ? <MainApp /> : <PasswordScreen onUnlock={handleUnlock} />}
    </div>
  );
}
