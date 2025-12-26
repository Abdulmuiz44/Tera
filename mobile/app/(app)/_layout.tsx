import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0a0a0a',
          borderBottomColor: '#222',
          borderBottomWidth: 1,
        },
        headerTintColor: '#00d4ff',
        headerTitleStyle: {
          fontWeight: '600',
          color: '#fff',
        },
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#222',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTitle: 'Tera',
          tabBarLabel: 'Chat',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          headerTitle: 'Tools',
          tabBarLabel: 'Tools',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}
