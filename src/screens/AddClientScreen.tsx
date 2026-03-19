/**
 * AddClientScreen
 * Форма для створення нового клієнта
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createClient } from '../api/clientsApi';
import { NavigationProps } from '../navigation/types';

const AddClientScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Помилка', "Ім'я клієнта обов'язкове");
      return;
    }

    try {
      setLoading(true);
      await createClient({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Помилка', err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Field
            label="Ім'я *"
            value={name}
            onChangeText={setName}
            placeholder="Наприклад: Марія Коваль"
            autoFocus
          />
          <Field
            label="Телефон"
            value={phone}
            onChangeText={setPhone}
            placeholder="+380..."
            keyboardType="phone-pad"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="client@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Нотатки"
            value={notes}
            onChangeText={setNotes}
            placeholder="Додаткова інформація..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Зберегти клієнта</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoFocus,
  multiline,
  numberOfLines,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#555"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoFocus={autoFocus}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, gap: 16 },

  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  inputMultiline: { height: 100, paddingTop: 14 },

  saveBtn: {
    marginTop: 8,
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default AddClientScreen;
