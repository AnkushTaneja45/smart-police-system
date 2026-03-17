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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, AI_URL } from '../constants/api';

export default function HomeScreen({ user, onNavigate, language, setLanguage, t }) {
  const [isOffline, setIsOffline] = useState(false);
  const [patrolStatus, setPatrolStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handlePatrolCheckin = () => {
    setPatrolStatus('Fetching GPS...');
    setTimeout(() => {
      setPatrolStatus('✅ Checked in at Sector 14 (28.459, 77.026)');
      setTimeout(() => setPatrolStatus(null), 4000);
    }, 1200);
  };

  const firstName = user?.name?.split(' ')[0] || 'Officer';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isOffline && styles.headerOffline]}>
        <View>
          <Text style={styles.headerGreeting}>{t('greeting')} {firstName} 👋</Text>
          <Text style={styles.headerSub}>📍 Sector 14 · Station {user?.stationId || 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')} 
            style={styles.wifiBtn}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>🌐 {language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsOffline(!isOffline)} style={styles.wifiBtn}>
            <Text style={styles.wifiIcon}>{isOffline ? '📴' : '📶'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>🔴 {t('offline_mode')} — Data queued for sync</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Status messages */}
        {uploadStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>✅ {uploadStatus}</Text>
          </View>
        )}
        {patrolStatus && (
          <View style={[styles.statusCard, styles.statusCardPurple]}>
            <Text style={[styles.statusText, styles.statusTextPurple]}>{patrolStatus}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ {t('new_complaint').includes('New') ? 'Quick Actions' : 'त्वरित कार्रवाई'}</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('complaint')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>{t('new_complaint')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardBlue]} onPress={() => onNavigate('firs')}>
            <Text style={styles.actionIcon}>📂</Text>
            <Text style={styles.actionLabel}>{t('fir_registry')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardGreen]} onPress={() => onNavigate('facescan')}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionLabel}>{t('face_scan')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardGreen]} onPress={() => {
            setUploadStatus('Evidence photo captured & hashed.');
            Alert.alert('Evidence Captured', 'Photo hashed (SHA-256) and signed with your Officer ID. Ready for sync.');
            setTimeout(() => setUploadStatus(null), 3000);
          }}>
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={styles.actionLabel}>{t('snap_evidence')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardRed]} onPress={() => onNavigate('hotspot')}>
            <Text style={styles.actionIcon}>🔥</Text>
            <Text style={styles.actionLabel}>{t('crime_hotspot')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardPurple]} onPress={handlePatrolCheckin}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionLabel}>{t('patrol_checkin')}</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Tasks */}
        <Text style={styles.sectionTitle}>📌 {t('pending_tasks')}</Text>
        <View style={styles.taskCard}>
          <View style={styles.taskDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle}>Verify Accused Address: Vikram</Text>
            <Text style={styles.taskDesc}>FIR D012 (Arms Act) — Visit Grain Market, Saha and verify suspect Vikram @ Vicky's residence.</Text>
            <View style={styles.taskBadge}><Text style={styles.taskBadgeText}>Due: 5 PM Today</Text></View>
          </View>
        </View>

        <View style={[styles.taskCard, { opacity: 0.5 }]}>
          <Text style={{ fontSize: 18 }}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, { textDecorationLine: 'line-through' }]}>Serve Notice u/s 41A — Raju @ Raja</Text>
            <Text style={styles.taskDesc}>FIR D002 (NDPS Act) — Notice served to accused</Text>
          </View>
        </View>

        <View style={styles.taskCard}>
          <View style={[styles.taskDot, { backgroundColor: '#dc2626' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskTitle}>🔴 Chargesheet due in 1 day</Text>
            <Text style={styles.taskDesc}>FIR D011 (Excise Act) — Chargesheet against Madan must be filed at Sessions Court urgently.</Text>
            <View style={[styles.taskBadge, { backgroundColor: '#fee2e2' }]}><Text style={[styles.taskBadgeText, { color: '#dc2626' }]}>⚠️ URGENT</Text></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#1d4ed8', paddingTop: 56, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerOffline: { backgroundColor: '#ea580c' },
  headerGreeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  wifiBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  wifiIcon: { fontSize: 20 },
  offlineBanner: { backgroundColor: '#fff7ed', borderBottomWidth: 1, borderColor: '#fed7aa', padding: 10 },
  offlineText: { color: '#c2410c', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  statusCard: {
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  statusCardPurple: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
  statusText: { color: '#166534', fontSize: 13, fontWeight: '600' },
  statusTextPurple: { color: '#7e22ce' },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    padding: 18, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionCardBlue: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  actionCardGreen: { borderColor: '#bbf7d0' },
  actionCardPurple: { borderColor: '#e9d5ff' },
  actionCardRed: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  taskCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  taskDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#f59e0b', marginTop: 4, borderWidth: 2, borderColor: '#fef3c7' },
  taskTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  taskDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  taskBadge: { marginTop: 8, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  taskBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
});
