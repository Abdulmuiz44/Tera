import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { teraAPI } from '@/lib/api';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function ToolsScreen() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const response = await teraAPI.getTools();

      if (response.success && response.data) {
        setTools(response.data);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTools();
    setRefreshing(false);
  };

  const handleToolPress = (toolId: string) => {
    // Navigate to tool detail screen or open modal
    console.log('Tool pressed:', toolId);
    // TODO: Implement navigation to tool detail
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tools}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => handleToolPress(item.id)}
          >
            <View style={styles.toolHeader}>
              <Text style={styles.toolName}>{item.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.toolDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00d4ff"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00d4ff',
    flex: 1,
  },
  badge: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  toolDescription: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});
