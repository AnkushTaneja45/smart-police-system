import React, { useState } from 'react';
import MobileAuth from './components/MobileAuth';
import BeatDashboard from './components/BeatDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mobile_user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4">
      {/* Phone simulator frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-black rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-slate-900 mx-auto ring-1 ring-slate-800 relative z-10">
        
        {/* Notch simulation */}
        <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 rounded-b-xl w-32 mx-auto"></div>
        
        {/* System Bar */}
        <div className="absolute top-0 w-full h-12 flex items-center justify-between px-6 z-40 text-white font-semibold text-xs pt-2">
           <span>09:41</span>
           <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21L15.6 16.2C14.6 15.4 13.4 15 12 15C10.6 15 9.4 15.4 8.4 16.2L12 21ZM12 3C7.95 3 4.21 4.34 1.2 6.6L3 9C5.5 7.12 8.62 6 12 6C15.38 6 18.5 7.12 21 9L22.8 6.6C19.79 4.34 16.05 3 12 3ZM12 9C9.3 9 6.81 9.89 4.8 11.4L6.6 13.8C8.1 12.67 9.97 12 12 12C14.03 12 15.9 12.67 17.4 13.8L19.2 11.4C17.19 9.89 14.7 9 12 9Z" /></svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2H10V4H8.33C7.6 4 7 4.6 7 5.33V20.67C7 21.4 7.6 22 8.33 22H15.67C16.4 22 17 21.4 17 20.67V5.33C17 4.6 16.4 4 15.67 4Z" /></svg>
           </div>
        </div>

        {/* Display Content */}
        {!user ? (
          <MobileAuth onLogin={setUser} />
        ) : (
          <BeatDashboard user={user} />
        )}

      </div>
      
      {/* Decorative environment elements */}
      <h1 className="absolute top-10 left-10 text-slate-500 font-bold text-2xl hidden lg:block tracking-widest opacity-50">SMART POLICE<br/>MVP DEVICE PREVIEW</h1>
    </div>
  );
}
