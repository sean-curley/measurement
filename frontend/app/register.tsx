import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';;
  
  const handleRegister = async () => {
    setLoading(true);
    try {
      const url = `${backendBaseUrl}/api/auth/register`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      Alert.alert('Success', 'Account created! Please log in.');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Register</ThemedText>

        <ThemedInput
          type="default"
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <ThemedInput
          type="default"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <ThemedInput
          type="default"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : (
          <Button title="Register" onPress={handleRegister} />
        )}

        <ThemedText type="link" onPress={() => router.push('/')}>
          Already have an account? Log in
        </ThemedText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
});
