import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import InvestigationTracker from './InvestigationTracker';

export default function SHODashboard({ user, t }) {
  const [complaints, setComplaints] = useState([]);
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ pending: 0, activeFIRs: 0, closures: 0 });
  
  // Navigation State
  const [selectedFir, setSelectedFir] = useState(null);
  const [showSopModal, setShowSopModal] = useState(false);
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [assigningTo, setAssigningTo] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'closed'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [compRes, firRes, offRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/cases/complaints`, { headers }),
        fetch(`${API_BASE_URL}/api/cases/firs`, { headers }),
        fetch(`${API_BASE_URL}/api/cases/officers`, { headers })
      ]);
 
      if (compRes.ok && firRes.ok && offRes.ok) {
        setComplaints(await compRes.json());
        setFirs(await firRes.json());
        setOfficers(await offRes.json());
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIO = async (complaintId, ioId, sections) => {
      setIsAssigning(true);
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/cases/assign-io`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  complaintId: complaintId,
                  ioId: ioId,
                  sections: sections || 'General Investigation'
              })
          });
          if (response.ok) {
              setAssigningTo(null);
              fetchData(); // Refresh both lists
          } else {
              alert("Failed to assign IO");
          }
      } catch (err) {
          console.error("Assign IO error:", err);
      } finally {
          setIsAssigning(false);
      }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-400">{t('processing')}</div>;

  return (
    <div className="flex h-full font-sans text-slate-800 bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-police-dark text-slate-300 flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Smart Station 101</h1>
              <p className="text-[10px] text-blue-300 font-mono tracking-wider opacity-80 uppercase">{t('command_center')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setSelectedFir(null)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${!selectedFir ? 'bg-police-blue text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-75" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
             {t('overview_dash')}
          </button>
          <div className="px-3 pt-6 pb-2">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('case_management')}</p>
          </div>
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
             <span className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M38 4v16m-8-8h16" /></svg>
                 {t('fir_registry')}
             </span>
          </button>
          <button onClick={() => setShowSopModal(true)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
              <span className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 {t('sop_templates')}
              </span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
           <div className="flex items-center gap-3 mb-2">
               <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white border border-slate-500 shadow-inner">
                   {user.name.substring(0, 2).toUpperCase()}
               </div>
               <div>
                   <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                   <p className="text-xs text-slate-400 mt-1">{user.role}</p>
               </div>
           </div>
           <button onClick={() => {
              localStorage.removeItem('token');
              window.location.reload();
           }} className="mt-3 w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-red-500/20 rounded transition-colors border border-transparent hover:border-red-500/30">
               Sign Out Securely
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 relative">
        {selectedFir ? (
            <InvestigationTracker fir={selectedFir} onBack={() => setSelectedFir(null)} />
        ) : (
            <div className="p-8 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">{t('station_overview')}</h2>
                        <p className="text-slate-500 mt-1">{t('real_time_metrics')}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                         </div>
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                             {t('pending_triage')}
                         </h3>
                         <div className="mt-4 flex items-end justify-between">
                             <p className="text-4xl font-black text-slate-800">{complaints.filter(c => (c.Status || c.status) === 'Pending').length}</p>
                             <p className="text-sm font-semibold text-red-500 flex items-center bg-red-50 px-2 py-0.5 rounded">{t('action_req')}</p>
                         </div>
                    </div>
                    
                    <div 
                        onClick={() => setActiveTab('active')}
                        className={`rounded-xl shadow-sm border p-6 flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden cursor-pointer ${activeTab === 'active' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-slate-100'}`}
                    >
                         <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                         </div>
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                             {t('active_investigations')}
                         </h3>
                         <div className="mt-4 flex items-end justify-between">
                             <p className="text-4xl font-black text-slate-800">{firs.filter(f => (f.Status || f.status) === 'Under Investigation').length}</p>
                             <p className="text-sm font-semibold text-blue-600 flex items-center">{t('in_progress')}</p>
                         </div>
                    </div>
 
                    <div 
                        onClick={() => setActiveTab('closed')}
                        className={`rounded-xl shadow-sm border p-6 flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden cursor-pointer ${activeTab === 'closed' ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20' : 'bg-white border-slate-100'}`}
                    >
                         <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                         </div>
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                             {t('closed_solved')}
                         </h3>
                         <div className="mt-4 flex items-end justify-between">
                             <p className="text-4xl font-black text-slate-800">{firs.filter(f => (f.Status || f.status) === 'Closed').length}</p>
                             <p className="text-sm font-semibold text-emerald-600 flex items-center">{t('finalized')}</p>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Unassigned Complaints */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">{t('review_inbox')}</h3>
                            <span className="text-xs font-semibold bg-white px-2 py-1 rounded shadow-sm text-slate-600 border border-slate-200">{t('needs_triage')}</span>
                        </div>
                        <ul className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                            {complaints.filter(c => (c.Status || c.status) === 'Pending').map(complaint => (
                                <li key={complaint.ComplaintID || complaint.complaintid} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-slate-900 leading-tight">{complaint.ComplainantName || complaint.complainantname}</p>
                                        <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase">{new Date(complaint.CreatedAt || complaint.createdat).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{complaint.Description || complaint.description}</p>
                                    <div className="flex gap-2">
                                         <button disabled={isAssigning} onClick={() => setAssigningTo(complaint)} className="flex-1 text-xs bg-police-blue text-white py-2 rounded font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50">
                                             {t('assign_io')}
                                         </button>
                                        <button 
                                            onClick={() => setViewingComplaint(complaint)}
                                            className="flex-1 text-xs bg-white text-slate-700 border border-slate-300 py-2 rounded font-bold hover:bg-slate-100 transition-colors"
                                        >
                                            {t('view_details')}
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {complaints.filter(c => (c.Status || c.status) === 'Pending').length === 0 && (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className="font-bold text-slate-600">Inbox Zero</p>
                                    <p className="text-sm text-slate-400 mt-1">No pending complaints require triage.</p>
                                </div>
                            )}
                        </ul>
                    </div>

                    {/* Active Investigations & Deadlines */}
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setActiveTab('active')}
                                    className={`text-lg font-bold transition-colors ${activeTab === 'active' ? 'text-police-blue border-b-2 border-police-blue' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t('active_investigations')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('closed')}
                                    className={`text-lg font-bold transition-colors ${activeTab === 'closed' ? 'text-police-blue border-b-2 border-police-blue' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t('closed_solved')}
                                </button>
                            </div>
                        </div>
                        <ul className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                            {firs.filter(f => activeTab === 'active' ? (f.Status || f.status) !== 'Closed' : (f.Status || f.status) === 'Closed').map(fir => {
                                // Mock deadline calculation (30 days from creation)
                                const deadline = new Date(new Date(fir.CreatedAt || fir.createdat).getTime() + (30 * 24 * 60 * 60 * 1000));
                                const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                                const isUrgent = daysLeft <= 5;

                                return (
                                    <li key={fir.FIRID || fir.firid} className="p-4 hover:bg-slate-50 transition-colors group flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-slate-800">FIR #{fir.FIRID || fir.firid}</span>
                                                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded truncate max-w-[150px]">{fir.SectionsApplied || fir.sectionsapplied}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    {fir.AssignedIOName || "Assigned"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    Created: {new Date(fir.CreatedAt || fir.createdat).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            {/* Compliance Deadline Widget */}
                                            <div className={`flex flex-col items-end ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Chargesheet Due</span>
                                                <span className="text-sm font-bold">{daysLeft} Days Left</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => setSelectedFir(fir)}
                                                className="bg-white border border-slate-200 text-slate-700 hover:text-police-blue hover:bg-slate-50 hover:border-blue-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                                            >
                                                {t('open_case_file')}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                            {firs.filter(f => activeTab === 'active' ? (f.Status || f.status) !== 'Closed' : (f.Status || f.status) === 'Closed').length === 0 && (
                                <div className="p-20 text-center text-slate-400">
                                    <p className="text-lg font-bold">No {activeTab} cases found.</p>
                                    <p className="text-sm">Station 101 is up to date.</p>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )}
      </div>

      {showSopModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">SOP Templates</h3>
                      <button onClick={() => setShowSopModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </div>
                  <div className="p-6">
                      <p className="text-slate-600 mb-6">Select a category to view the standard operating procedure checklist automatically attached to cases.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Theft / Burglary', 'Assault / Grievous Hurt', 'Cyber Crime', 'Financial Fraud'].map(cat => (
                              <div key={cat} className="p-4 border border-slate-200 rounded-lg hover:border-police-blue hover:bg-blue-50 cursor-pointer transition-colors group">
                                  <h4 className="font-bold text-slate-800 group-hover:text-police-blue">{cat}</h4>
                                  <p className="text-sm text-slate-500 mt-1">12 Mandatory Steps</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
       {viewingComplaint && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">Complaint Details</h3>
                      <button onClick={() => setViewingComplaint(null)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">&times;</button>
                  </div>
                  <div className="p-8">
                      <div className="mb-6">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Complainant Name</label>
                          <p className="text-lg font-bold text-slate-800">{viewingComplaint.ComplainantName || viewingComplaint.complainantname}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mobile Number</label>
                              <p className="font-semibold text-slate-700">{viewingComplaint.ComplainantMobile || viewingComplaint.complainantmobile || 'N/A'}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date & Time</label>
                              <p className="font-semibold text-slate-700">{new Date(viewingComplaint.CreatedAt || viewingComplaint.createdat).toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{viewingComplaint.Description || viewingComplaint.description}</p>
                      </div>
                      {(viewingComplaint.Address || viewingComplaint.address) && (
                          <div className="mb-6">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Incident Address</label>
                              <p className="text-slate-700 text-sm">{viewingComplaint.Address || viewingComplaint.address}</p>
                          </div>
                      )}
                       <div className="flex gap-3 justify-end mt-8">
                          <button onClick={() => setViewingComplaint(null)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Close</button>
                          <button 
                             onClick={() => {
                                setAssigningTo(viewingComplaint);
                                setViewingComplaint(null);
                             }}
                             className="px-6 py-2 bg-police-blue text-white rounded-lg text-sm font-bold hover:bg-blue-800 shadow-md transition-shadow"
                          >
                             Select IO & Convert to FIR
                          </button>
                      </div>
                  </div>
              </div>
          </div>
       )}

       {assigningTo && (
           <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <h3 className="text-xl font-bold text-slate-800">Assign Investigating Officer</h3>
                       <button onClick={() => setAssigningTo(null)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">&times;</button>
                   </div>
                   <div className="p-8">
                       <p className="text-slate-600 mb-6">Select an officer to assign to Complaint #{assigningTo.ComplaintID || assigningTo.complaintid} and convert it to an FIR.</p>
                       
                       {officers.length > 0 ? (
                           <div className="grid grid-cols-1 gap-4">
                               {officers.map(officer => (
                                   <button
                                       key={officer.OfficerID || officer.officerid}
                                       onClick={() => handleAssignIO(assigningTo.ComplaintID || assigningTo.complaintid, officer.OfficerID || officer.officerid, 'General Investigation')}
                                       disabled={isAssigning}
                                       className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-police-blue hover:bg-blue-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                   >
                                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 shadow-inner">
                                           {(officer.Name || officer.name).substring(0, 2).toUpperCase()}
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-slate-800 group-hover:text-police-blue text-left">{officer.Name || officer.name}</h4>
                                           <p className="text-sm text-slate-500 mt-0.5 text-left">{officer.Rank || officer.rank}</p>
                                       </div>
                                       {isAssigning && <span className="ml-auto text-slate-400">Assigning...</span>}
                                   </button>
                               ))}
                           </div>
                       ) : (
                           <div className="p-8 text-center text-slate-400">No officers available.</div>
                       )}

                       <div className="flex justify-end mt-8">
                           <button onClick={() => setAssigningTo(null)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
