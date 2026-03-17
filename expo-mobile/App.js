import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ComplaintScreen from './screens/ComplaintScreen';
import FaceScanScreen from './screens/FaceScanScreen';
import FIRsScreen from './screens/FIRsScreen';
import HotspotMapScreen from './screens/HotspotMapScreen';
import { translations } from './constants/translations';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'complaint' | 'facescan' | 'firs' | 'hotspot'
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  // Rehydrate auth and language state from storage on launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('mobile_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        
        const savedLang = await AsyncStorage.getItem('mobile_lang');
        if (savedLang) setLanguage(savedLang);
      } catch (_) {}
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mobile_user');
    await AsyncStorage.removeItem('mobile_token');
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} t={t} />;
  }

  // Simple in-app navigation (no extra deps needed)
  if (currentScreen === 'complaint') {
    return <ComplaintScreen user={user} language={language} t={t} onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'facescan') {
    return <FaceScanScreen language={language} t={t} onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'firs') {
    return <FIRsScreen user={user} language={language} t={t} onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'hotspot') {
    return <HotspotMapScreen language={language} t={t} onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <HomeScreen
      user={user}
      language={language}
      t={t}
      onNavigate={(screen) => setCurrentScreen(screen)}
      onLogout={handleLogout}
      setLanguage={(lang) => {
        setLanguage(lang);
        AsyncStorage.setItem('mobile_lang', lang);
      }}
    />
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
});
