import React, { useState } from 'react';
import { View, Text,ScrollView, KeyboardAvoidingView, Platform, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import Constants from 'expo-constants';

const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';;

const LoginPage = () => {
  console.log('LoginPage rendered');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }
      const url = `${backendBaseUrl}/api/auth/login`
      console.log('Logging in with URL:', url);
      const body = JSON.stringify({ email, password });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      await login(data.token); // saves token + redirects
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
      
      <ThemedText type="title">Log in</ThemedText>
      

      <ThemedInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        type="default"
      />

      <ThemedInput
        type="default"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />

      <ThemedText type="link" onPress={() => router.push('/register')}>
        Don't have an account? Register
      </ThemedText>

      <ThemedText type="link" onPress={() => router.push('/forgot-password')}>
        Forgot password?
      </ThemedText>
    
    </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
};

export default LoginPage;


const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
  
});
