// app/tabs/profile.tsx

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const { logout, userToken } = useAuth();
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/user/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load user data');
        }

        setUserData(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Could not fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userToken]);

  return (
    <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <IconSymbol
              size={310}
              color="#808080"
              name="person.circle"
              style={styles.headerImage}
            />
          }>
        <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Profile</ThemedText>
        </ThemedView>

        {loading ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : userData ? (
          <>
            <ThemedText type="subtitle">Name</ThemedText>
            <ThemedText>{userData.name}</ThemedText>

            <ThemedText type="subtitle" style={{ marginTop: 16 }}>Email</ThemedText>
            <ThemedText>{userData.email}</ThemedText>

            <Button title="Log out" onPress={logout} />
          </>
        ) : (
          <ThemedText>Could not load user data</ThemedText>
        )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
