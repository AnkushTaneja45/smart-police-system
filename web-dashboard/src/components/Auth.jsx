import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function Auth({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Deep integration: sync with mobile app's expected storage keys
        localStorage.setItem('mobile_token', data.token);
        localStorage.setItem('mobile_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        const errorMsg = data.error || data.message || `Server returned ${response.status}: ${response.statusText}`;
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      setError(`Network error: ${err.message}. Is the backend running at ${API_BASE_URL}?`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 transform transition-all">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-police-blue rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Smart Police System</h2>
          <p className="text-sm text-gray-500 mt-2">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number (Officer ID)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent transition-colors"
              placeholder="e.g. 9876543212"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password / PIN</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-police-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-police-blue transition-colors"
          >
            Authenticate & Login
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Mock Credentials for MVP Testing:</p>
          <p>SHO: 9876543212 / password</p>
          <p>IO: 9876543211 / password</p>
        </div>
      </div>
    </div>
  );
}
