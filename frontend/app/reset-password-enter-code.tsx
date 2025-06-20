import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Button, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInput } from '@/components/ThemedInput';

export default function ResetCodeEntryPage() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');

  const handleSubmitCode = () => {
    if (!code) {
      Alert.alert('Please enter the code');
      return;
    }
    router.push({ pathname: '/reset-password', params: { email, code } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Enter Reset Code</ThemedText>
        <ThemedInput placeholder="Reset Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
        <Button title="Next" onPress={handleSubmitCode} />
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
