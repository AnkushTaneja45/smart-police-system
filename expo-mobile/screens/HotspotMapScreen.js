import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HOTSPOTS = [
  { id: 'H1', type: 'Theft', location: 'Sector 12 Market', coords: '30.375, 76.782', intensity: 'High', color: '#ef4444' },
  { id: 'H2', type: 'Assault', location: 'NH-1 Bypass', coords: '30.380, 76.775', intensity: 'Medium', color: '#f59e0b' },
  { id: 'H3', type: 'Vandalism', location: 'Model Town', coords: '30.382, 76.783', intensity: 'Low', color: '#10b981' },
  { id: 'H4', type: 'Brawl', location: 'City Station Road', coords: '30.370, 76.770', intensity: 'Medium', color: '#f59e0b' },
];

export default function HotspotMapScreen({ onBack, language, t }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('crime_hotspot')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Map Simulation */}
      <View style={styles.mapContainer}>
        {/* Synthetic Map Background */}
        <View style={styles.mapBg}>
          <View style={styles.gridLineV} />
          <View style={[styles.gridLineV, { left: width * 0.3 }]} />
          <View style={[styles.gridLineV, { left: width * 0.6 }]} />
          <View style={styles.gridLineH} />
          <View style={[styles.gridLineH, { top: 150 }]} />
          <View style={[styles.gridLineH, { top: 300 }]} />
          
          <Text style={styles.streetLabel}>Sector 14 Main Rd</Text>
          <Text style={[styles.streetLabel, { top: 280, left: 180, transform: [{ rotate: '90deg' }] }]}>MG Road</Text>
        </View>

        {/* Floating Google Pins */}
        {HOTSPOTS.map((h, i) => (
          <View key={h.id} style={[styles.pinContainer, { top: 60 + (i * 80), left: 40 + (i * 60) }]}>
             <View style={[styles.pin, { backgroundColor: h.color }]}>
                <Text style={styles.pinIcon}>📍</Text>
             </View>
             <View style={styles.pinShadow} />
             <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>{h.type}</Text>
             </View>
          </View>
        ))}
      </View>

      {/* Legend / List */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{t('area_intelligence')}</Text>
        <ScrollView contentContainerStyle={styles.list}>
          {HOTSPOTS.map(h => (
            <TouchableOpacity key={h.id} style={styles.hotspotItem}>
              <View style={[styles.statusDot, { backgroundColor: h.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hotspotLocation}>{h.location}</Text>
                <Text style={styles.hotspotType}>{h.type} Hotspot · {h.coords}</Text>
              </View>
              <View style={[styles.intensityBadge, { backgroundColor: h.color + '15' }]}>
                <Text style={[styles.intensityText, { color: h.color }]}>{h.intensity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0',
  },
  backBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  backBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  mapContainer: { flex: 1, backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden' },
  mapBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#cbd5e1', padding: 20 },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  gridLineH: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  streetLabel: { position: 'absolute', top: 120, left: 40, fontSize: 10, fontWeight: '900', color: 'rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: 2 },
  pinContainer: { position: 'absolute', alignItems: 'center' },
  pin: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    zIndex: 2,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  pinIcon: { fontSize: 18 },
  pinShadow: { width: 10, height: 4, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.2)', marginTop: -2 },
  pinLabel: {
    backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4,
    borderWidth: 1, borderColor: '#e2e8f0', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  pinLabelText: { fontSize: 9, fontWeight: '800', color: '#1e293b' },
  sheet: {
    height: 300, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 12,
    padding: 20,
  },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  list: { paddingBottom: 20 },
  hotspotItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#f1f5f9',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  hotspotLocation: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  hotspotType: { fontSize: 11, color: '#64748b', marginTop: 2 },
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  intensityText: { fontSize: 10, fontWeight: '800' },
});
