import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, AI_URL } from '../constants/api';

export default function ComplaintScreen({ user, onBack, language, t }) {
  const [complainantName, setComplainantName] = useState('Ramesh Kumar');
  const [narrative, setNarrative] = useState('A theft occurred at Sector 14 market near the ATM at around 10 PM. A red motorcycle HR-26-XX-1234 was involved. The suspect Ramesh fled the scene.');
  const [isOffline] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [extractedData, setExtractedData] = useState({ incidentType: '', location: '', sections: '' });

  const handleVoiceDictation = async () => {
    setIsDictating(true);
    try {
      const res = await fetch(`${AI_URL}/api/ai/speech-to-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: 'mock_audio' }),
      });
      const data = await res.json();
      if (data.success && data.transcription) {
        setNarrative(prev => prev ? `${prev}\n\n${data.transcription}` : data.transcription);
      }
    } catch (e) {
      Alert.alert('AI Dictation Offline', 'Could not connect to AI service for voice processing.');
    } finally {
      setIsDictating(false);
    }
  };

  const extractEntities = async () => {
    if (!narrative) return;
    setIsExtracting(true);
    try {
      const res = await fetch(`${AI_URL}/api/ai/extract-entities?text=${encodeURIComponent(narrative)}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setExtractedData({
          incidentType: data.entities?.INCIDENT_TYPE || '',
          location: data.entities?.LOCATION || '',
          sections: (data.suggested_bns_sections || []).join(', '),
        });
      }
    } catch (e) {
      Alert.alert('AI Service Unavailable', 'Could not connect to AI service. Make sure it is running.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!complainantName || !narrative) {
      Alert.alert('Validation', 'Please fill in complainant name and narrative.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isOffline) {
        setTimeout(() => { setSubmitted(true); setIsSubmitting(false); }, 1000);
        return;
      }
      const token = await AsyncStorage.getItem('mobile_token') || '';
      const response = await fetch(`${BACKEND_URL}/api/cases/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          complainantName,
          mobile: user?.mobile || '9876543210',
          address: extractedData.location || 'Sector 14',
          gps: '28.4595, 77.0266',
          description: narrative,
          incidentDateTime: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const err = await response.json();
        Alert.alert('Failed', err.error || 'Could not submit complaint.');
      }
    } catch (err) {
      Alert.alert('Network Error', `Cannot reach backend at ${BACKEND_URL}.\nUpdate PC IP in constants/api.js`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Complaint Saved!</Text>
        <Text style={styles.successDesc}>
          {isOffline
            ? 'Saved locally. Will sync to DB when online.'
            : 'Synced to secure police database.'}
        </Text>
        <TouchableOpacity style={styles.returnBtn} onPress={onBack}>
          <Text style={styles.returnBtnText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('new_complaint')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Voice Dictation Note */}
        {/* Voice Dictation Card */}
        <TouchableOpacity 
          style={[styles.dictationCard, isDictating && styles.dictationActive]} 
          onPress={handleVoiceDictation} 
          disabled={isDictating}
        >
          <View style={[styles.dictationIconBox, isDictating && styles.iconBoxActive]}>
            {isDictating ? (
              <View style={styles.animBox}>
                <View style={[styles.wave, { height: 12 }]} />
                <View style={[styles.wave, { height: 24 }]} />
                <View style={[styles.wave, { height: 16 }]} />
              </View>
            ) : (
              <Text style={styles.dictationIcon}>🎙️</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dictationTitle, isDictating && { color: '#1d4ed8' }]}>
              {isDictating ? 'AI Listening...' : t('voice_dictation')}
            </Text>
            <Text style={styles.dictationSub}>
              {isDictating ? 'Speaking in Hinglish/Hindi is supported' : t('tap_to_speak')}
            </Text>
          </View>
          {isDictating && <View style={styles.recordingDot} />}
        </TouchableOpacity>

        {/* Fields */}
        <Text style={styles.label}>{t('complainant_name')}</Text>
        <TextInput
          style={styles.input}
          value={complainantName}
          onChangeText={setComplainantName}
          placeholder="E.g. Sumit Verma"
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.narrativeHeader}>
          <Text style={styles.label}>{t('narrative_facts')}</Text>
          <TouchableOpacity style={styles.extractBtn} onPress={extractEntities} disabled={isExtracting}>
            {isExtracting
              ? <ActivityIndicator size="small" color="#4f46e5" />
              : <Text style={styles.extractBtnText}>✨ {t('extract_ai')}</Text>}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textArea}
          value={narrative}
          onChangeText={setNarrative}
          placeholder="Type or dictate the facts of the incident here..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* AI Results */}
        {extractedData.incidentType !== '' && (
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <View style={styles.aiDot} />
              <Text style={styles.aiCardTitle}>AI Extracted Details</Text>
            </View>
            <Text style={styles.aiLabel}>Incident Type</Text>
            <Text style={styles.aiValue}>{extractedData.incidentType}</Text>
            <Text style={styles.aiLabel}>Location</Text>
            <Text style={styles.aiValue}>{extractedData.location}</Text>
            <Text style={styles.aiLabel}>Suggested Sections</Text>
            <Text style={[styles.aiValue, { color: '#dc2626', fontWeight: '700' }]}>{extractedData.sections}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>📤 {isOffline ? 'Save to Offline Queue' : t('submit_complaint')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f1f5f9',
  },
  backBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  backBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  scroll: { flex: 1 },
  dictationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  dictationActive: {
    backgroundColor: '#eff6ff', borderColor: '#3b82f6',
    borderWidth: 2,
  },
  dictationIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: '#dbeafe' },
  animBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  wave: { width: 4, borderRadius: 2, backgroundColor: '#3b82f6' },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', marginRight: 4 },
  dictationIcon: { fontSize: 24 },
  dictationTitle: { fontSize: 15, fontWeight: '800', color: '#334155', marginBottom: 2 },
  dictationSub: { fontSize: 13, color: '#64748b' },
  label: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: {
    borderBottomWidth: 2, borderColor: '#e2e8f0', paddingVertical: 10,
    color: '#1e293b', fontSize: 16, marginBottom: 20,
  },
  narrativeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  extractBtn: { backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  extractBtnText: { fontSize: 12, fontWeight: '700', color: '#4f46e5' },
  textArea: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 14, color: '#1e293b', fontSize: 14, lineHeight: 22,
    minHeight: 120, marginBottom: 20,
  },
  aiCard: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 14, padding: 16, marginBottom: 24 },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  aiCardTitle: { fontSize: 11, fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1 },
  aiLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  aiValue: { fontSize: 15, color: '#1e293b', marginBottom: 12 },
  submitBtn: {
    backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  successContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 280, lineHeight: 22, marginBottom: 32 },
  returnBtn: { backgroundColor: '#1d4ed8', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  returnBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
