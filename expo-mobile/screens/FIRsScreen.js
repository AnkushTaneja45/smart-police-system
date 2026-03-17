import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../constants/api';

// Demo FIR data – always shown for offline/demo mode
const DEMO_FIRS = [
  { id: 'D001', crimeType: 'Vehicle Theft', sections: 'BNS 303(2), MV Act 379', complainant: 'Mohit Garg', date: '19 Feb 2026', status: 'Under Investigation', officer: 'Suresh Singh', address: 'Sector 12 Market, Ambala', description: 'Honda Activa HR01AB1234 stolen from market parking at ~11 PM. No key, vehicle forcibly taken.', deadline: '20 Mar 2026', urgent: false },
  { id: 'D002', crimeType: 'NDPS Act', sections: 'NDPS Act Sec 21(c), 29', complainant: 'Constable Jagdish Rao', date: '24 Feb 2026', status: 'Under Investigation', officer: 'Suresh Singh', address: 'NH-1 Bypass Chowk, Ambala', description: 'Accused Raju @ Raja caught with 1.2 kg Smack (Heroin) during naka checking. Arrested on spot.', deadline: '25 Mar 2026', urgent: false },
  { id: 'D003', crimeType: 'POCSO Act', sections: 'POCSO Act Sec 6, BNS 64', complainant: 'Sushila Devi (Mother)', date: '26 Feb 2026', status: 'Under Investigation', officer: 'Deepak Sharma', address: 'Vill. Fatehpur, Naraingarh, Ambala', description: '9-year-old daughter sexually assaulted by neighbour Ramkumar (45). Victim produced before SJPU.', deadline: '27 Mar 2026', urgent: false },
  { id: 'D004', crimeType: 'Dowry Demand', sections: 'BNS 84, 85, Dowry Prob. Act Sec 3, 4', complainant: 'Neha Rani', date: '28 Feb 2026', status: 'Under Investigation', officer: 'Anjali Verma', address: 'Mohalla Ram Nagar, Ambala City', description: 'In-laws and husband demanding Rs 5 lakh + car. Complainant beaten and thrown out of matrimonial home.', deadline: '30 Mar 2026', urgent: false },
  { id: 'D005', crimeType: 'Rape', sections: 'BNS 64(1), 65', complainant: 'Kamla Devi (Victim)', date: '03 Mar 2026', status: 'Under Investigation', officer: 'Anjali Verma', address: 'Vill. Jandli, Ambala Cantt', description: 'Victim (22F) lured on false pretext of marriage, raped at accused\'s flat. Accused absconding. MLC done.', deadline: '02 Apr 2026', urgent: false },
  { id: 'D006', crimeType: 'Gambling Act', sections: 'Punjab Gambling Act Sec 3, 13', complainant: 'SI Naresh Dhull', date: '05 Mar 2026', status: 'Chargesheeted', officer: 'Suresh Singh', address: 'Baldev Nagar, Ambala', description: '8 persons caught gambling (Teen Patti). Cash Rs 42,500 and cards recovered in raid.', deadline: '13 Mar 2026', urgent: true },
  { id: 'D007', crimeType: 'Murder', sections: 'BNS 103(1), 109, Arms Act 25', complainant: 'Karamvir Singh', date: '07 Mar 2026', status: 'Under Investigation', officer: 'Suresh Singh', address: 'Vill. Mullana, Ambala', description: 'Victim Balvir Singh (35) shot dead by Sukhchain & associates over land dispute. Body sent for PM.', deadline: '06 Apr 2026', urgent: false },
  { id: 'D008', crimeType: 'Cyber Crime', sections: 'IT Act 66C, 66D, BNS 318(4)', complainant: 'Ashok Mehra', date: '08 Mar 2026', status: 'Under Investigation', officer: 'Anjali Verma', address: 'Swastik Apartments, Ambala City', description: 'WhatsApp vishing by fake SBI official. OTP shared, Rs 1,85,000 fraudulently debited from account.', deadline: '07 Apr 2026', urgent: false },
  { id: 'D009', crimeType: 'Snatching', sections: 'BNS 304(2), 305(a)', complainant: 'Priya Sharma', date: '10 Mar 2026', status: 'Under Investigation', officer: 'Suresh Singh', address: 'Model Town Chowk, Ambala City', description: 'Two youths on black motorcycle (no plate) snatched gold chain, handbag (Samsung S23 + Rs 8,000).', deadline: '09 Apr 2026', urgent: false },
  { id: 'D010', crimeType: 'Burglary', sections: 'BNS 305(a), 331(4)', complainant: 'Harpreet Kaur', date: '11 Mar 2026', status: 'Under Investigation', officer: 'Anjali Verma', address: 'Housing Board Colony, Ambala', description: 'Unknown persons broke lock at night; gold jewellery (Rs 2.5L), laptop, cash Rs 15,000 stolen.', deadline: '10 Apr 2026', urgent: false },
  { id: 'D011', crimeType: 'Excise Act', sections: 'Excise Act Sec 61(1)(a), 61(2)', complainant: 'ASI Balwant Singh', date: '12 Mar 2026', status: 'Chargesheeted', officer: 'Suresh Singh', address: 'VPO Shahzadpur, Naraingarh', description: '85 bottles illicit liquor seized from accused Madan (55) being transported on hand cart during patrol.', deadline: '16 Mar 2026', urgent: true },
  { id: 'D012', crimeType: 'Arms Act', sections: 'Arms Act Sec 25, 27, 54, 59', complainant: 'Insp. Rajbir Nain', date: '13 Mar 2026', status: 'Under Investigation', officer: 'Anjali Verma', address: 'Grain Market, Saha, Ambala', description: 'Country-made pistol (.315 bore) + 3 live cartridges recovered from accused Vikram @ Vicky (28).', deadline: '12 Apr 2026', urgent: false },
  { id: 'D013', crimeType: 'Hurt / Assault', sections: 'Pending Review', complainant: 'Ranjit Lal', date: '14 Mar 2026', status: 'Pending', officer: 'Unassigned', address: 'VPO Barara, Ambala', description: 'Assaulted by neighbour Ginder Singh & 3 sons with iron rod over land dispute. Fracture; MLC at CHC Barara.', deadline: '—', urgent: false },
];

const STATUS_COLORS = {
  'Under Investigation': { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Chargesheeted': { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'Closed': { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  'Pending': { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
};

const CRIME_ICONS = {
  'Vehicle Theft': '🚗', 'NDPS Act': '💊', 'POCSO Act': '🛡️', 'Dowry Demand': '⚖️',
  'Rape': '🔒', 'Gambling Act': '🎲', 'Murder': '🔴', 'Cyber Crime': '💻',
  'Snatching': '💰', 'Burglary': '🔓', 'Excise Act': '🍶', 'Arms Act': '🔫', 'Hurt / Assault': '🩹',
};

export default function FIRsScreen({ user, onBack, language, t }) {
  const [firs, setFirs] = useState(DEMO_FIRS);
  const [loading, setLoading] = useState(false);
  const [selectedFir, setSelectedFir] = useState(null);
  const [filter, setFilter] = useState('All');

  const FILTERS = ['All', 'Under Investigation', 'Chargesheeted', 'Pending'];

  // Try to load from backend (gracefully fails to demo data)
  useEffect(() => {
    fetchFIRs();
  }, []);

  const fetchFIRs = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('mobile_token') || '';
      const res = await fetch(`${BACKEND_URL}/api/cases/firs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          // Merge backend data on top of demo data (backend wins)
          const backendMapped = data.map(f => ({
            id: `FIR-${f.FIRID || f.firid}`,
            crimeType: (f.SectionsApplied || f.sectionsapplied || '').split(',')[0] || 'General',
            sections: f.SectionsApplied || f.sectionsapplied || '',
            complainant: f.ComplainantName || f.complainantname || 'Unknown',
            date: new Date(f.CreatedAt || f.createdat).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: f.Status || f.status || 'Under Investigation',
            officer: f.AssignedIOName || 'Assigned',
            address: f.Address || '',
            description: f.Description || f.description || '',
            deadline: f.ChargesheetDeadline || f.chargesheetdeadline || '',
            urgent: false,
          }));
          setFirs([...DEMO_FIRS, ...backendMapped]);
        }
      }
    } catch (_) {
      // Silently use demo data
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'All' ? firs : firs.filter(f => f.status === filter);
  const counts = FILTERS.slice(1).reduce((acc, s) => ({ ...acc, [s]: firs.filter(f => f.status === s).length }), {});

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{t('fir_registry')}</Text>
          <Text style={styles.headerSub}>Station 101 · {firs.length} Total</Text>
        </View>
        <TouchableOpacity onPress={fetchFIRs} style={styles.refreshBtn}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: '#eff6ff' }]}>
          <Text style={[styles.statNum, { color: '#1d4ed8' }]}>{counts['Under Investigation'] || 0}</Text>
          <Text style={[styles.statLabel, { color: '#1d4ed8' }]}>{t('in_progress') || 'Active'}</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statNum, { color: '#92400e' }]}>{counts['Chargesheeted'] || 0}</Text>
          <Text style={[styles.statLabel, { color: '#92400e' }]}>Chargesheeted</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.statNum, { color: '#991b1b' }]}>{counts['Pending'] || 0}</Text>
          <Text style={[styles.statLabel, { color: '#991b1b' }]}>{t('metrics_pending') || 'Pending'}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} color="#1d4ed8" />}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const colors = STATUS_COLORS[item.status] || STATUS_COLORS['Pending'];
          const icon = CRIME_ICONS[item.crimeType] || '📁';
          return (
            <TouchableOpacity style={[styles.card, item.urgent && styles.cardUrgent]} onPress={() => setSelectedFir(item)} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={styles.crimeIconBox}>
                  <Text style={{ fontSize: 22 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.firId}>{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
                      <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.crimeType}>{item.crimeType}</Text>
                  <Text style={styles.complainant}>👤 {item.complainant}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>📅 {item.date}</Text>
                <Text style={styles.meta}>👮 {item.officer}</Text>
                {item.urgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>⚠️ URGENT</Text></View>}
              </View>
              <Text style={styles.sectionsText} numberOfLines={1}>⚖️ {item.sections}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail Modal */}
      {selectedFir && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedFir(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{CRIME_ICONS[selectedFir.crimeType] || '📁'} {selectedFir.crimeType}</Text>
                <Text style={styles.modalSubtitle}>{selectedFir.id} · Station 101, Ambala</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFir(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕ {t('close') || 'Close'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
              {/* Status */}
              <View style={[styles.detailStatusRow, { backgroundColor: (STATUS_COLORS[selectedFir.status] || STATUS_COLORS['Pending']).bg }]}>
                <View style={[styles.statusDot, { backgroundColor: (STATUS_COLORS[selectedFir.status] || STATUS_COLORS['Pending']).dot, width: 10, height: 10, margin: 0 }]} />
                <Text style={[styles.detailStatusText, { color: (STATUS_COLORS[selectedFir.status] || STATUS_COLORS['Pending']).text }]}>{selectedFir.status}</Text>
                {selectedFir.urgent && <View style={[styles.urgentBadge, { marginLeft: 8 }]}><Text style={styles.urgentText}>⚠️ URGENT</Text></View>}
              </View>

              <Section label="COMPLAINANT" value={selectedFir.complainant} />
              <Section label="DATE REGISTERED" value={selectedFir.date} />
              <Section label="ADDRESS / LOCATION" value={selectedFir.address || '—'} />
              <Section label="ASSIGNED IO" value={selectedFir.officer} />
              <Section label="LEGAL SECTIONS" value={selectedFir.sections} highlight />
              <Section label="CHARGESHEET DEADLINE" value={selectedFir.deadline} highlight={selectedFir.urgent} />

              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>FACTS / DESCRIPTION</Text>
                <Text style={styles.detailDescription}>{selectedFir.description}</Text>
              </View>

              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('SOP Checklist', 'SOP steps for ' + selectedFir.crimeType + ' will be shown here.')}>
                <Text style={styles.actionBtnText}>📋 View SOP Checklist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]} onPress={() => Alert.alert('Documents', 'FIR document generation would open here.')}>
                <Text style={[styles.actionBtnText, { color: '#1e293b' }]}>📄 Generate FIR Document</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

function Section({ label, value, highlight }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: '#dc2626', fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: '#1d4ed8',
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  refreshBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, marginLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  statChip: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  filterRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 10, maxHeight: 50 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardUrgent: { borderColor: '#fca5a5', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  crimeIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  firId: { fontSize: 11, fontWeight: '800', color: '#64748b', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  crimeType: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 3 },
  complainant: { fontSize: 12, color: '#64748b' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9' },
  meta: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  urgentBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  urgentText: { fontSize: 9, fontWeight: '800', color: '#dc2626' },
  sectionsText: { fontSize: 11, color: '#6d28d9', fontWeight: '600', fontStyle: 'italic' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0f172a',
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  modalSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  detailStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 20 },
  detailStatusText: { fontWeight: '800', fontSize: 14 },
  detailRow: { marginBottom: 16 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#1e293b', fontWeight: '600' },
  detailCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  detailDescription: { fontSize: 14, color: '#475569', lineHeight: 22, marginTop: 8 },
  actionBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1d4ed8',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
