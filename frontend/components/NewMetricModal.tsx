import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Constants from 'expo-constants';
import { ThemedInput } from './ThemedInput';
import { ThemedText } from './ThemedText';
import { Menu, Divider, Text } from 'react-native-paper';
import { SegmentedButtons } from 'react-native-paper';
const backendBaseUrl = Constants.expoConfig?.extra?.BACKEND_BASE_URL ?? 'http://0.0.0.0:8080';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToken: string;
};

export const NewMetricModal: React.FC<Props> = ({ visible, onClose, onSuccess, userToken }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [metricType, setMetricType] = useState<'number' | 'bool'>('number');
  const [loading, setLoading] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);

  const handleSubmit = async () => {
    if (!name || !metricType) {
      Alert.alert('Missing Info', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendBaseUrl}/api/custom_metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ name, metricType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create metric');
      }

      onSuccess();
      onClose();
      setName('');
      setUnit('');
      setMetricType('number');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modal}>
              <ThemedText type="title">New Custom Metric</ThemedText>

              <ThemedInput
                placeholder="Metric Name"
                value={name}
                onChangeText={setName}
              />

              {/* Dropdown */}
              <SegmentedButtons
                value={metricType}
                onValueChange={setMetricType}
                buttons={[
                    { value: 'number', label: 'Number' },
                    { value: 'bool', label: 'Bool' },
                ]}
                />

              <View style={{ marginTop: 12 }}>
                <Button title={loading ? 'Submitting...' : 'Submit'} onPress={handleSubmit} disabled={loading} />
              </View>
              <Button title="Cancel" onPress={onClose} color="#999" />
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    paddingBottom: 50,
  },
});
