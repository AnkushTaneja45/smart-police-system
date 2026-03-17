import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { BrainCircuit, ShieldAlert, Navigation } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';
import { AI_BASE_URL } from '../config';

export default function SPDashboard({ user }) {
  const [nlQuery, setNlQuery] = useState('');
  const [queryProcessing, setQueryProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleNLSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    
    setQueryProcessing(true);
    setShowResult(false);
    
    try {
        const res = await fetch(`${AI_BASE_URL}/api/ai/text-to-sql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ natural_language: nlQuery, station_id: 101 })
        });
        const data = await res.json();
        if (data.success) {
            setAiResponse(data);
            setShowResult(true);
        }
    } catch (err) {
        console.error("AI Text-to-SQL Failed:", err);
        // Fallback or error state
    } finally {
        setQueryProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">District Command Center</h2>
          <p className="text-slate-500 mt-1">Supervisory overview for {user.rank}</p>
        </div>
        <div className="text-sm border border-slate-200 rounded-lg px-4 py-2 bg-white shadow-sm flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
           State: <span className="font-bold text-slate-700">Haryana</span>
        </div>
      </header>

      {/* AI Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-600"></div>
        <form onSubmit={handleNLSearch}>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
            </svg>
            Natural Language Query (AI Analytics)
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Try: 'Show heinous cases with pending arrest in Station 101' or 'Show theft complaints this month'"
                className="w-full pl-4 pr-12 py-4 border border-slate-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 transition-colors text-lg"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
              />
              <div className="absolute right-4 top-4">
                <kbd className="hidden sm:inline-block font-sans px-2 py-1 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded h-7">Enter ↵</kbd>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-all flex items-center gap-2 hover:shadow-md disabled:bg-indigo-400"
              disabled={queryProcessing}
            >
              {queryProcessing ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing Intent...</>
              ) : (
                <>Run Query</>
              )}
            </button>
          </div>
        </form>

        {/* AI Query Result Mock */}
        {showResult && (
          <div className="mt-6 border border-indigo-100 bg-indigo-50/50 rounded-lg p-5 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-xs text-indigo-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                SQL Generated (Intent: {aiResponse?.identified_intent})
              </div>
            </div>
            <p className="font-mono text-sm bg-slate-900 text-green-400 p-3 rounded overflow-x-auto mb-4 border border-slate-700">
               {aiResponse?.generated_sql}
            </p>
            <div className="bg-white border border-slate-200 rounded p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Query Results (3 found)</h4>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-2">FIR No</th>
                    <th className="px-4 py-2">Sections (BNS)</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Station</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">102/2026</td>
                    <td className="px-4 py-3 text-red-600 font-medium">BNS 304 (Culpable Homicide)</td>
                    <td className="px-4 py-3"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">Absconding Arrest</span></td>
                    <td className="px-4 py-3">101</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">089/2026</td>
                    <td className="px-4 py-3 text-red-600 font-medium">BNS 302 (Murder)</td>
                    <td className="px-4 py-3"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">Pending Scrutiny</span></td>
                    <td className="px-4 py-3">101</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* District Charts Grid - using Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Chart 1: Crime Category Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Crime Category Dist</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Theft', count: 40 },
                { name: 'Assault', count: 70 },
                { name: 'Cyber', count: 45 },
                { name: 'Accident', count: 90 },
                { name: 'NDPS', count: 30 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 7-Day Trend Analysis */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">7-Day FIR Registration Trend</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Mon', registered: 12, closed: 8 },
                  { day: 'Tue', registered: 19, closed: 12 },
                  { day: 'Wed', registered: 15, closed: 10 },
                  { day: 'Thu', registered: 22, closed: 18 },
                  { day: 'Fri', registered: 30, closed: 15 },
                  { day: 'Sat', registered: 25, closed: 20 },
                  { day: 'Sun', registered: 18, closed: 14 }
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="registered" name="FIR Registered" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="closed" name="Cases Closed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Predictive AI Deployment Widget */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl shadow-lg h-80 flex flex-col relative overflow-hidden text-white border border-indigo-500/30">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BrainCircuit size={120} />
             </div>
             
             <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-6">
                     <div>
                         <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                             <BrainCircuit size={16} /> 
                             AI Predictive Deployment
                         </h3>
                         <p className="text-[10px] text-slate-400 mt-1">Forecast based on historical FIRs & Weather</p>
                     </div>
                     <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-1 rounded text-[10px] font-bold animate-pulse">LIVE FORECAST</span>
                 </div>

                 <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-start gap-3 hover:bg-white/10 transition-colors">
                         <div className="mt-0.5"><ShieldAlert size={16} className="text-red-400" /></div>
                         <div className="flex-1">
                             <h4 className="font-bold text-sm text-white">High Alert: Sector 14 Market</h4>
                             <p className="text-xs text-slate-300 mt-0.5">85% probability of snatching incidents between 7 PM - 10 PM. Recommend +2 PCR vans.</p>
                         </div>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-start gap-3 hover:bg-white/10 transition-colors">
                         <div className="mt-0.5"><Navigation size={16} className="text-orange-400" /></div>
                         <div className="flex-1">
                             <h4 className="font-bold text-sm text-white">Traffic Congestion + Disputes</h4>
                             <p className="text-xs text-slate-300 mt-0.5">MG Road junction expected to face gridlock due to festival. Deploy +4 Traffic Marshals.</p>
                         </div>
                     </div>
                 </div>

                 <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-lg transition-colors border border-indigo-400/50">
                     Issue Deployment Orders
                 </button>
             </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Crime Hotspot GIS Map */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
               </svg>
               Live Crime Hotspots
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">GIS Sync Active</span>
          </div>
          <div className="flex-1 relative bg-slate-100 overflow-hidden">
             {/* Abstract Map Background Simulation */}
             <div className="absolute inset-0 opacity-20" style={{ 
               backgroundImage: 'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, #f1f5f9 25%, #f1f5f9 75%, #cbd5e1 75%, #cbd5e1)',
               backgroundPosition: '0 0, 20px 20px',
               backgroundSize: '40px 40px'
             }}></div>
             
             {/* Hotspot Nodes */}
             <div className="absolute top-[30%] left-[25%] h-12 w-12 bg-red-500/30 rounded-full flex items-center justify-center animate-pulse cursor-pointer group">
                <div className="h-4 w-4 bg-red-600 rounded-full border-2 border-white shadow-lg relative">
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 w-[140px] text-center">
                        <span className="font-bold text-red-400 block mb-1">Sector 14 Market</span>
                        High Theft Density (48 HRS)
                    </div>
                </div>
             </div>

             <div className="absolute top-[60%] left-[65%] h-24 w-24 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse cursor-pointer group">
                <div className="h-4 w-4 bg-orange-500 rounded-full border-2 border-white shadow-lg relative">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 w-[140px] text-center">
                        <span className="font-bold text-orange-400 block mb-1">MG Road Junction</span>
                        Traffic Accidents & Snatching
                    </div>
                </div>
             </div>

             <div className="absolute top-[80%] left-[15%] h-8 w-8 bg-blue-500/30 rounded-full flex items-center justify-center animate-pulse cursor-pointer group">
                <div className="h-3 w-3 bg-blue-600 rounded-full border-2 border-white shadow-lg relative">
                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 w-[120px] text-center">
                        <span className="font-bold text-blue-400 block mb-1">Industrial Area</span>
                        Cyber Fraud Activity
                    </div>
                </div>
             </div>

             {/* UI Overlays */}
             <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                 <button className="h-8 w-8 bg-white border border-slate-300 rounded shadow text-slate-600 flex items-center justify-center hover:bg-slate-50">+</button>
                 <button className="h-8 w-8 bg-white border border-slate-300 rounded shadow text-slate-600 flex items-center justify-center hover:bg-slate-50">-</button>
             </div>
             
             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold uppercase p-2 rounded border border-slate-200 shadow-sm text-slate-500 tracking-wider">
                 Filter: All Violations (Last 7 Days)
             </div>
          </div>
        </div>

        {/* Knowledge Graph Integrator */}
        <KnowledgeGraph />
      </div>

    </div>
  );
}
