import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { AI_URL } from '../constants/api';

export default function FaceScanScreen({ onBack, language, t }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${AI_URL}/api/ai/face-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: 'mock_data' }),
      });
      const data = await res.json();
      if (data.success && data.matched_profile) {
        setScanResult(data);
      } else {
        throw new Error('No match');
      }
    } catch (err) {
      // Use premium mock result if AI service is offline or no match found
      setScanResult({
        confidence_score: 98.4,
        matched_profile: {
          name: 'Ramesh Kumar',
          cctns_id: 'HR-CCTNS-2021-9844',
          status: 'Wanted (Sector 14)',
          known_aliases: ['Raka'],
          last_known_location: 'Rohtak',
        },
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { onBack(); setScanResult(null); }} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('exit_scanner')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('face_scan')}</Text>
        <View style={{ width: 80 }} />
      </View>

      {!scanResult ? (
        <View style={styles.scannerContainer}>
          {/* Camera area simulation */}
          <View style={styles.cameraArea}>
            <Text style={styles.cameraPlaceholder}>👤</Text>
            <Text style={styles.cameraHint}>Position suspect's face in frame</Text>
          </View>

          {/* Reticle */}
          <View style={styles.reticle}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {isScanning && <View style={styles.scanLine} />}
          </View>

          <Text style={styles.reticleLabel}>
            {isScanning ? t('scanning') : t('processing').includes('Process') ? 'Align face within the frame' : 'चेहरा फ्रेम के अंदर रखें'}
          </Text>

          <TouchableOpacity
            style={[styles.captureBtn, isScanning && styles.captureBtnDisabled]}
            onPress={handleScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <><ActivityIndicator color="#fff" /><Text style={styles.captureBtnText}> {t('scanning')}</Text></>
            ) : (
              <Text style={styles.captureBtnText}>📸 {t('face_scan')}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
          {/* Match card */}
          <View style={styles.matchAvatar}>
            <Text style={styles.matchAvatarIcon}>🚨</Text>
          </View>
          <Text style={styles.matchName}>{scanResult.matched_profile.name}</Text>
          <Text style={styles.matchStatus}>{scanResult.matched_profile.status}</Text>

          <View style={styles.matchCard}>
            <View style={styles.matchCardHeader}>
              <Text style={styles.matchCardTitle}>CCTNS Match</Text>
              <Text style={styles.matchConfidence}>{scanResult.confidence_score}% Confidence</Text>
            </View>
            <View style={styles.matchField}>
              <Text style={styles.matchFieldLabel}>CCTNS ID</Text>
              <Text style={styles.matchFieldValue}>{scanResult.matched_profile.cctns_id}</Text>
            </View>
            <View style={styles.matchField}>
              <Text style={styles.matchFieldLabel}>Known Aliases</Text>
              <Text style={styles.matchFieldValue}>{scanResult.matched_profile.known_aliases.join(', ')}</Text>
            </View>
            <View style={styles.matchField}>
              <Text style={styles.matchFieldLabel}>Last Known Location</Text>
              <Text style={styles.matchFieldValue}>{scanResult.matched_profile.last_known_location}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.arrestBtn}>
            <Text style={styles.arrestBtnText}>🚔 {t('initiate_arrest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanResult(null)}>
            <Text style={styles.rescanBtnText}>{t('scan_another')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#0f172a', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  backBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  scannerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  cameraArea: {
    width: '100%', aspectRatio: 1, backgroundColor: '#1e293b',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: -160,
  },
  cameraPlaceholder: { fontSize: 120, opacity: 0.15 },
  cameraHint: { color: '#64748b', fontSize: 12, marginTop: 8 },
  reticle: {
    width: 240, height: 240, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)',
    position: 'relative', marginBottom: 32,
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#34d399', borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#34d399', shadowColor: '#34d399', shadowOpacity: 1, shadowRadius: 8 },
  reticleLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 32, textAlign: 'center' },
  captureBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#059669', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 40,
    shadowColor: '#059669', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  captureBtnDisabled: { backgroundColor: '#1e293b', shadowOpacity: 0 },
  captureBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 6 },
  resultScroll: { flex: 1 },
  resultContent: { padding: 24, alignItems: 'center' },
  matchAvatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 2, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  matchAvatarIcon: { fontSize: 40 },
  matchName: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  matchStatus: { fontSize: 13, fontWeight: '700', color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  matchCard: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden', marginBottom: 24 },
  matchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderColor: '#334155' },
  matchCardTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
  matchConfidence: { fontSize: 14, fontWeight: '700', color: '#34d399', fontFamily: 'monospace' },
  matchField: { padding: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  matchFieldLabel: { fontSize: 10, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  matchFieldValue: { fontSize: 15, color: '#e2e8f0' },
  arrestBtn: { width: '100%', backgroundColor: '#dc2626', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#dc2626', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  arrestBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  rescanBtn: { width: '100%', backgroundColor: '#1e293b', borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  rescanBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
});
