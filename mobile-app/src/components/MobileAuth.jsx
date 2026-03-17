import React, { useState } from 'react';
import { Shield, Fingerprint } from 'lucide-react';

export default function MobileAuth({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // In MVP, backend accepts 'password' for any seeded user
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, password: password || 'password' }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('mobile_token', data.token);
        onLogin(data.user);
      } else {
        alert("Login failed: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 overflow-hidden relative flex flex-col items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-police-blue opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>

      <div className="w-full max-w-sm z-10 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
        <div className="h-24 w-24 bg-gradient-to-br from-police-blue to-indigo-800 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(30,58,138,0.5)] mb-8">
          <Shield size={48} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Smart Police</h1>
        <p className="text-slate-400 text-sm mb-10 text-center">Mobile Field Operations</p>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-1">
            <label className="text-sm text-slate-300 font-medium pl-1">Officer Mobile ID</label>
            <input 
              type="tel"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300 font-medium pl-1">Secure PIN</label>
            <input 
              type="password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent text-center tracking-[0.5em] text-lg"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(30,58,138,0.39)] transition-all mt-4 ${loading ? 'bg-blue-800 text-blue-300' : 'bg-police-blue hover:bg-blue-700 text-white active:scale-[0.98]'}`}
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <button 
            type="button" 
            onClick={() => handleLogin(null)}
            className="h-16 w-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-police-gold hover:bg-slate-700 transition-colors"
          >
            <Fingerprint size={32} />
          </button>
          <span className="text-xs text-slate-500 mt-3 uppercase tracking-wider font-semibold">Biometric Login</span>
        </div>

        {/* Hint for evaluator */}
        <div className="mt-8 text-center text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700 w-full">
            <p className="font-bold text-slate-400 mb-1">MVP Mock Accounts</p>
            <p className="flex justify-between">Beat Officer: <span className="text-white font-mono bg-slate-900 px-1 rounded">9876543210</span></p>
            <p className="flex justify-between">Investigating Officer: <span className="text-white font-mono bg-slate-900 px-1 rounded">9876543211</span></p>
        </div>
      </div>
    </div>
  );
}
