import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Button, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';
import Constants from 'expo-constants';

const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';

export default function ResetPasswordPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirm) {
      Alert.alert('Error', 'Fill out both password fields');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const body = JSON.stringify({token: code, newPassword: password })
    try {
      const res = await fetch(`${backendBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!res.ok) {
        throw new Error(`'Failed to reset password'`); 
      }

      Alert.alert('Password reset successfully');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Reset Your Password</ThemedText>
        <ThemedInput placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry />
        <ThemedInput placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <Button title={loading ? 'Resetting...' : 'Reset Password'} onPress={handleResetPassword} disabled={loading} />
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
