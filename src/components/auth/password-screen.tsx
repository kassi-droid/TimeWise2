"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordScreenProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = 'Kennedy';

export default function PasswordScreen({ onUnlock }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordCheck = () => {
    if (password === CORRECT_PASSWORD) {
      onUnlock();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handlePasswordCheck();
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center p-4 animate-slide-up">
      <Card className="w-full max-w-sm shadow-xl bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground">
            <Lock size={32} />
          </div>
          <CardTitle className="font-headline text-2xl">Access Required</CardTitle>
          <CardDescription>Enter password to access TimeWise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              className="p-6 text-lg text-center"
              autoFocus
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handlePasswordCheck} className="w-full text-lg py-6" size="lg">
            Unlock
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
