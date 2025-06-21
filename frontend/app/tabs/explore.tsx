import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';


import { Pressable } from 'react-native';
import { NewMetricModal } from '@/components/NewMetricModal';
import { useAuth } from '@/context/AuthContext';


type CustomMetric = {
  id: string;
  name: string;
  metricType: string;
};

export default function ExploreTab() {
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const router = useRouter();
  const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';
  const { userToken } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const fetchMetrics = async () => {
            try {
              const res = await fetch(`${backendBaseUrl}/api/custom_metrics`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
          });

          const data = await res.json();
          
          // Adjust depending on structure
          if (!Array.isArray(data)) {
            console.error('Expected an array but got:', data);
            Alert.alert('Error', 'Unexpected server response');
            return;
          }
          setMetrics(data);
        } catch (err) {
          console.error('Failed to fetch metrics:', err);
          Alert.alert('Error', 'Failed to load metrics');
        }
      };
  useEffect(() => {
    fetchMetrics();
  }, []);



  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="plus.circle"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Your Custom Metrics</ThemedText>
      </ThemedView>

      {metrics.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.metricItem}
          onPress={() => router.push({ pathname: `/custom-metric/${item.id}`, params: { name: item.name } })}
        >
          <ThemedText type="subtitle">{item.name}</ThemedText>
          <ThemedText>{item.metricType}</ThemedText>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <IconSymbol name="plus" size={32} color="white" />
      </TouchableOpacity>

      {userToken && (
      <NewMetricModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchMetrics}
        userToken={userToken}
      />
      )}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
