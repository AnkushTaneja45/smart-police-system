import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../constants/api';

export default function LoginScreen({ onLogin, t }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile) {
      Alert.alert('Error', 'Please enter your Officer Mobile ID');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password: password || 'password' }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('mobile_token', data.token);
        await AsyncStorage.setItem('mobile_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Network Error', `Cannot reach server at ${BACKEND_URL}.\n\nMake sure:\n1. Backend is running (npm run start-backend)\n2. PC IP in constants/api.js is correct`);
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login without network
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Try real login with demo credentials first
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9876543210', password: 'password' }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        await AsyncStorage.setItem('mobile_token', data.token);
        await AsyncStorage.setItem('mobile_user', JSON.stringify(data.user));
        onLogin(data.user);
        return;
      }
    } catch (_) {
      // Backend unavailable — fall through to offline demo mode
    } finally {
      setLoading(false);
    }
    // Offline fallback: store a recognizable mock token
    const demoUser = { id: 1, name: 'Constable Rajesh Kumar', role: 'beat_officer', stationId: 14, mobile: '9876543210' };
    await AsyncStorage.setItem('mobile_token', 'demo_offline_token');
    await AsyncStorage.setItem('mobile_user', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🛡️</Text>
        </View>

        <Text style={styles.title}>{t('app_title')}</Text>
        <Text style={styles.subtitle}>Mobile Field Operations</Text>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Officer Mobile ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <Text style={styles.label}>Secure PIN</Text>
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('login').includes('Log') ? 'Authenticate' : 'प्रमाणित करें'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Biometric / Demo */}
        <TouchableOpacity style={styles.biometricBtn} onPress={handleDemoLogin}>
          <Text style={styles.biometricIcon}>👆</Text>
        </TouchableOpacity>
        <Text style={styles.biometricLabel}>{t('login').includes('Log') ? 'Biometric / Demo Login' : 'बायोमेट्रिक / डेमो लॉगिन'}</Text>

        {/* Hint */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>MVP Mock Accounts</Text>
          <Text style={styles.hintText}>Beat Officer: <Text style={styles.hintCode}>9876543210</Text></Text>
          <Text style={styles.hintText}>IO Officer: <Text style={styles.hintCode}>9876543211</Text></Text>
          <Text style={[styles.hintText, { marginTop: 6, fontSize: 10, color: '#dc2626' }]}>
            (Password: any text, or leave blank)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: {
    width: 96, height: 96, borderRadius: 20,
    backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  badgeIcon: { fontSize: 48 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 32 },
  card: { width: '100%', backgroundColor: '#1e293b', borderRadius: 20, padding: 24, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#f1f5f9', fontSize: 16, marginBottom: 20,
  },
  pinInput: { letterSpacing: 8, textAlign: 'center' },
  btn: {
    backgroundColor: '#1d4ed8', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnDisabled: { backgroundColor: '#1e40af' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  biometricBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1e293b',
    borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  biometricIcon: { fontSize: 28 },
  biometricLabel: { fontSize: 10, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 },
  hint: {
    width: '100%', backgroundColor: '#1e293b', borderRadius: 12,
    borderWidth: 1, borderColor: '#334155', padding: 16,
  },
  hintTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8 },
  hintText: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  hintCode: { color: '#f1f5f9', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
