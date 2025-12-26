import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen
        name="signin"
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: 'default',
        }}
      />
    </Stack>
  );
}
