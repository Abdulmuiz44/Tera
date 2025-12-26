import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      setIsSignedIn(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsSignedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {isSignedIn ? (
        <Stack.Screen
          name="(app)"
          options={{
            animationEnabled: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{
            animationEnabled: false,
          }}
        />
      )}
    </Stack>
  );
}
