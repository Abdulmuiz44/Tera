import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="signin"
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
