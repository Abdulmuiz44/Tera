import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { getUser, clearAllData } from '@/lib/storage';

interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
}

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              // Clear secure storage
              await SecureStore.deleteItemAsync('auth_token');
              await SecureStore.deleteItemAsync('user_id');

              // Clear local data
              await clearAllData();

              // Navigate to sign in
              router.replace('/(auth)/signin');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.accountInfo}>
              <View style={styles.accountField}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user.name}</Text>
              </View>
              <View style={styles.accountField}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              <View style={styles.accountField}>
                <Text style={styles.label}>Provider</Text>
                <Text style={styles.value}>{user.provider}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Version</Text>
          <Text style={styles.versionText}>Tera Mobile 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Tera is your AI learning and teaching companion. Learn anything,
            teach everything with the power of AI.
          </Text>
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleSignOut}
          >
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00d4ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountInfo: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  accountField: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 22,
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerZone: {
    marginTop: 20,
  },
  dangerButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
