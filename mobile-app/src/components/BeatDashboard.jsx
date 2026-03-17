import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Mic, FileText, Bell, CheckCircle, WifiOff, Send, User } from 'lucide-react';

export default function BeatDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isOffline, setIsOffline] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // AI Integration state
  const [narrative, setNarrative] = useState("A theft occurred at Sector 14 market near the ATM at around 10 PM. A red motorcycle HR-26-XX-1234 was involved. The suspect Ramesh fled the scene.");
  const [isDictating, setIsDictating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState({
      incidentType: '',
      location: '',
      sections: ''
  });

  const [complainantName, setComplainantName] = useState("Ramesh Kumar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patrolStatus, setPatrolStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const evidenceInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNarrative(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.onend = () => {
         setIsDictating(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsDictating(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition not supported in this browser.");
      }
    }
  };

  const handleEvidenceUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploadStatus("Uploading...");
      try {
          await new Promise(r => setTimeout(r, 1500));
          setUploadStatus(`Success: ${file.name} uploaded & hashed.`);
          setTimeout(() => setUploadStatus(null), 3000);
      } catch (err) {
          setUploadStatus("Upload failed.");
      }
  };

  const handlePatrolCheckin = () => {
      setPatrolStatus("Fetching GPS...");
      setTimeout(() => {
          setPatrolStatus("Checked in at Sector 14 (28.459, 77.026)");
          setTimeout(() => setPatrolStatus(null), 4000);
      }, 1000);
  };

  // Toggle network simulation
  const toggleNetwork = () => setIsOffline(!isOffline);

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col relative overflow-hidden text-slate-800">
      
      {/* Top Header */}
      <div className={`px-4 pt-10 pb-4 flex justify-between items-center text-white ${isOffline ? 'bg-orange-600' : 'bg-police-blue'} transition-colors duration-300`}>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h2>
          <p className="text-xs opacity-80 flex items-center gap-1">
            <MapPin size={10} /> Sector 14, Station {user.stationId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleNetwork} className="p-2 bg-white/10 rounded-full relative">
            {isOffline ? <WifiOff size={20} className="text-amber-200" /> : <WifiOff size={20} />}
            {isOffline && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-400"></span>}
          </button>
          <button className="p-2 bg-white/10 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-police-blue"></span>
          </button>
        </div>
      </div>

      {isOffline && (
        <div className="bg-orange-100 px-4 py-2 border-b border-orange-200 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 text-orange-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Offline Mode Active
          </div>
          <span className="text-[10px] text-orange-600 font-medium">Data queued for sync: 1</span>
        </div>
      )}

      {/* Main Content Scroll Area */}
      {activeTab === 'home' && (
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        
        {uploadStatus && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-[fadeIn_0.3s_ease]">
                <CheckCircle size={18} /> {uploadStatus}
            </div>
        )}
        
        {patrolStatus && (
            <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-[fadeIn_0.3s_ease]">
                <MapPin size={18} /> {patrolStatus}
            </div>
        )}

        {/* Quick Actions Grid */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('new_complaint')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 transition-colors active:scale-95"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 text-police-blue flex items-center justify-center">
              <FileText size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-700">New Complaint</span>
          </button>

          <button 
            onClick={() => setActiveTab('face_scan')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 transition-colors active:scale-95"
           >
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Camera size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-700">Suspect Face Scan</span>
          </button>

          <button onClick={() => evidenceInputRef.current?.click()} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 transition-colors active:scale-95">
            <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={evidenceInputRef} onChange={handleEvidenceUpload} />
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Camera size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-700">Snap Evidence</span>
          </button>

          <button onClick={handlePatrolCheckin} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:bg-purple-50 transition-colors active:scale-95">
            <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-700">Patrol Check-in</span>
          </button>
        </div>

        {/* Sync Queue Widget */}
        {isOffline && (
           <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-4 mb-8 hidden">
              {/* Added a hidden toggle for demo purposes actually I might want to show this */}
           </div>
        )}

        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pending Tasks</h3>
        
        {/* Timeline Tasks */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-blue-200 transition-colors">
            <div className="mt-1"><div className="h-3 w-3 rounded-full bg-amber-400 border-2 border-amber-100"></div></div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-800">Verify Address: Ramesh</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">FIR 102 - Go to Sector 14, Plot 89 and verify residence details for suspect.</p>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px] font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">Due: 5 PM</span>
              </div>
            </div>
          </div>
          
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-blue-200 transition-colors opacity-60">
            <div className="mt-1"><CheckCircle size={16} className="text-emerald-500" /></div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-800 line-through">Serve Notice u/s 41A</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">FIR 089 - Served to Amit Kumar</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mock Complaint Registration Flow */}
      {activeTab === 'new_complaint' && (
      <div className="flex-1 flex flex-col bg-white z-20 absolute inset-0 animate-slide-in">
         <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0">
          <button onClick={() => setActiveTab('home')} className="text-slate-500 py-2 font-medium flex items-center gap-1 text-sm bg-slate-50 px-3 rounded-lg active:bg-slate-100">
             &larr; Cancel
          </button>
          <h2 className="font-bold text-slate-800 text-lg">New Complaint</h2>
          <div className="w-16"></div> {/* Spacer */}
        </div>
        
        {showDraft ? (
           <div className="p-6 flex-1 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s_ease]">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                 <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Complaint Saved</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-[250px]">
                {isOffline ? "Your complaint has been encrypted and saved locally. It will automatically traverse to the SHO Cloud when network returns." : "Your complaint has been successfully synced to the secure police database."}
              </p>
              <button onClick={() => { setShowDraft(false); setActiveTab('home'); }} className="w-full bg-police-blue text-white py-4 rounded-xl font-bold shadow-md">
                Return to Dashboard
              </button>
           </div>
        ) : (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className={`border rounded-xl p-4 flex gap-3 items-start transition-colors cursor-pointer ${isDictating ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-100 text-indigo-800'}`} onClick={toggleDictation}>
              <Mic className={`shrink-0 mt-0.5 ${isDictating ? 'animate-pulse text-red-600' : ''}`} size={20} />
              <div className={`text-sm border-l pl-3 ${isDictating ? 'border-red-200' : 'border-indigo-200'}`}>
                 <p className="font-semibold mb-1">{isDictating ? 'Listening... Tap to stop' : 'Tap for AI Voice Dictation'}</p>
                 <p className="text-xs opacity-80">Speak securely to fill FIR narrative details. Tap again to stop.</p>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Complainant Name</label>
               <input type="text" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-police-blue text-slate-800 font-medium" placeholder="E.g. Sumit Verma" value={complainantName} onChange={e => setComplainantName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-500 uppercase">Narrative Facts</label>
                  <button 
                     onClick={async () => {
                         setIsExtracting(true);
                         try {
                             const res = await fetch(`http://localhost:8000/api/ai/extract-entities?text=${encodeURIComponent(narrative)}`, { method: 'POST' });
                             const data = await res.json();
                             if (data.success) {
                                 setExtractedData({
                                     incidentType: data.entities.INCIDENT_TYPE,
                                     location: data.entities.LOCATION,
                                     sections: data.suggested_bns_sections.join(', ')
                                 });
                             }
                         } catch (e) {
                             console.error("AI Error:", e);
                         } finally {
                             setIsExtracting(false);
                         }
                     }}
                     disabled={isExtracting}
                     className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold shadow-sm"
                  >
                     {isExtracting ? 'Analyzing...' : 'Extract Entities'}
                  </button>
               </div>
               <textarea 
                  rows="4" 
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-police-blue focus:ring-1 focus:ring-police-blue text-slate-800 text-sm leading-relaxed" 
                  placeholder="Type or dictate the facts of the incident here..."
               />
            </div>

            {/* AI Extracted Fields */}
            {extractedData.incidentType && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse block"></span>
                        <span className="text-xs font-bold text-blue-700 uppercase">AI Extracted Details</span>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Incident Type</label>
                       <input type="text" className="w-full border-b-2 border-transparent py-1 bg-transparent focus:outline-none text-slate-800 font-medium" value={extractedData.incidentType} readOnly />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                       <input type="text" className="w-full border-b-2 border-transparent py-1 bg-transparent focus:outline-none text-slate-800 font-medium" value={extractedData.location} readOnly />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Suggested Sections</label>
                       <textarea className="w-full border-b-2 border-transparent py-1 bg-transparent focus:outline-none text-red-700 font-bold text-sm" value={extractedData.sections} readOnly rows={2} />
                    </div>
                </div>
            )}
            
            <button 
                onClick={async () => {
                    if (!complainantName || !narrative) return;
                    setIsSubmitting(true);
                    
                    try {
                        const token = localStorage.getItem('mobile_token') || localStorage.getItem('token') || ''; 
                        
                        if (isOffline) {
                            setTimeout(() => {
                                setShowDraft(true);
                                setIsSubmitting(false);
                            }, 1000);
                            return;
                        }

                        const response = await fetch('http://localhost:5000/api/cases/complaints', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({
                                complainantName: complainantName,
                                mobile: "9876543210", 
                                address: extractedData.location || "Sector 14",
                                gps: "28.4595, 77.0266",
                                description: narrative,
                                incidentDateTime: new Date().toISOString()
                            })
                        });

                        if (response.ok) {
                            setShowDraft(true);
                            setNarrative('');
                            setExtractedData({ incidentType: '', location: '', sections: '' });
                        } else {
                            alert("Failed to sync complaint to the Cloud.");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Network error submitting complaint.");
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                disabled={isSubmitting}
                className="w-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-md mt-8 hover:bg-black transition-colors disabled:opacity-50"
            >
               <Send size={18} />
               {isSubmitting ? "Syncing to State DB..." : (isOffline ? "Save to Offline Queue" : "Submit Complaint")}
            </button>
            <div className="p-4"></div> {/* Bottom scroll padding */}
          </div>
        )}
      </div>
      )}

      {/* Face Scan Flow */}
      {activeTab === 'face_scan' && (
      <div className="flex-1 flex flex-col bg-slate-900 z-20 absolute inset-0 animate-slide-in text-white">
         <div className="px-4 py-4 flex items-center justify-between border-b border-white/10 bg-slate-900 sticky top-0 z-30">
          <button onClick={() => { setActiveTab('home'); setScanResult(null); }} className="text-slate-300 py-2 font-medium flex items-center gap-1 text-sm bg-white/5 hover:bg-white/10 px-3 rounded-lg active:bg-white/10 transition-colors">
             &larr; Exit Scanner
          </button>
          <div className="w-16"></div> {/* Spacer */}
        </div>
        
        {!scanResult ? (
            <div className="flex-1 flex flex-col items-center justify-center relative p-6">
                 {/* Live Camera Mock Background */}
                 <div className="absolute inset-0 bg-slate-800 flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900 z-10"></div>
                     <User size={200} className="text-slate-600 opacity-20" />
                 </div>
                 
                 <div className="relative z-20 flex flex-col items-center w-full">
                     <h3 className="text-xl font-bold mb-8 tracking-widest uppercase flex items-center gap-2 text-white drop-shadow-md">
                         <Camera /> AI Facial Match
                     </h3>
                     
                     {/* Scanner Reticle */}
                     <div className="relative w-64 h-64 border-2 border-emerald-500/30 mb-12">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500"></div>
                         
                         {isScanning && (
                             <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                         )}
                     </div>

                     <button 
                         onClick={async () => {
                             setIsScanning(true);
                             try {
                                 const res = await fetch('http://localhost:8000/api/ai/face-scan', {
                                     method: 'POST',
                                     headers: { 'Content-Type': 'application/json' },
                                     body: JSON.stringify({ image_base64: "mock_data" })
                                 });
                                 const data = await res.json();
                                 if (data.success) {
                                     setScanResult(data);
                                 }
                             } catch (err) {
                                 console.error("FRS Error:", err);
                             } finally {
                                 setIsScanning(false);
                             }
                         }}
                         disabled={isScanning}
                         className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-[0_4px_20px_rgba(5,150,105,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700 disabled:shadow-none"
                     >
                         {isScanning ? (
                             <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Scanning CCTNS...</>
                         ) : "Capture & Search"}
                     </button>
                 </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col p-6 animate-[fadeIn_0.5s_ease-out] relative bg-slate-900">
                <div className="text-center mb-6 pt-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <User size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-wide">{scanResult.matched_profile.name}</h3>
                    <p className="text-red-400 font-bold uppercase text-sm mt-1">{scanResult.matched_profile.status}</p>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">CCTNS Match</span>
                        <span className="text-emerald-400 font-mono text-sm">{scanResult.confidence_score}% Confidence</span>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">CCTNS ID</span>
                            <span className="font-mono text-sm text-slate-200">{scanResult.matched_profile.cctns_id}</span>
                        </div>
                         <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Known Aliases</span>
                            <span className="text-sm font-medium text-slate-200">{scanResult.matched_profile.known_aliases.join(', ')}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Last Known Location</span>
                            <span className="text-sm font-medium text-slate-200">{scanResult.matched_profile.last_known_location}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-md transition-colors">
                        Initiate Arrest / Detain
                    </button>
                    <button onClick={() => setScanResult(null)} className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors">
                        Scan Another Subject
                    </button>
                </div>
            </div>
        )}
      </div>
      )}

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 w-full h-16 bg-white border-t border-slate-200 flex items-center justify-around pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-police-blue' : 'text-slate-400'}`}>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <FileText size={24} />
          <span className="text-[10px] font-semibold">Cases</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-semibold">Search</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
      
    </div>
  );
}
