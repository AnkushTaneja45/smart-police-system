import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import SHODashboard from './components/SHODashboard';
import SPDashboard from './components/SPDashboard';
import { translations } from './translations';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState('en');
  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem('mobile_lang', language);
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mobile_token');
    localStorage.removeItem('mobile_user');
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-police-dark text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-police-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">{t('app_title')}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
               <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-police-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 EN
               </button>
               <button 
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'hi' ? 'bg-police-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 हिन्दी
               </button>
            </div>
            <a 
              href="/mobile-app/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-2 bg-police-blue hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors border border-blue-600 shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile App
            </a>
            <div className="text-right">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-police-gold font-medium uppercase tracking-wider">{user.rank} | Station {user.stationId}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm font-medium transition-colors"
            >
              {t('sign_out')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area Routing */}
      <main className="flex-1 w-full relative">
        {(user.rank === 'SHO' || user.rank === 'IO' || user.rank === 'Beat Officer') && <SHODashboard user={user} t={t} />}
        {(user.rank === 'SP' || user.rank === 'DSP') && <SPDashboard user={user} t={t} />}
      </main>
    </div>
  );
}

export default App;
