import React, { useState } from 'react';
import { Network, Search, User, Car, Phone, Shield } from 'lucide-react';
import { AI_BASE_URL } from '../config';

export default function KnowledgeGraph() {
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Mocking Neo4j / ElasticSearch fuzzy fetch
      const res = await fetch(`${AI_BASE_URL}/api/ai/fuzzy-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, type: 'suspect' })
      });
      const data = await res.json();
      if (data.success && data.entity) {
          setGraphData(data);
      } else {
          setGraphData({ notFound: true, query: searchQuery });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Network className="text-police-blue" size={20} />
          Knowledge Graph Explorer
        </h3>
        <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Neo4j Engine</span>
      </div>

      <div className="p-4 border-b border-slate-100">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-police-blue focus:border-transparent transition-all"
            placeholder="Entity Search (e.g. Ramesh, HR-26-XX-1234, 9988...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute inset-y-1 right-1 bg-police-blue hover:bg-blue-800 text-white px-4 rounded font-medium text-sm transition-colors"
          >
            {loading ? 'Mining...' : 'Traverse'}
          </button>
        </form>
      </div>

      <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center p-6">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         
         {!graphData && !loading && (
             <div className="text-center z-10 animate-[fadeIn_1s_ease]">
                 <Network className="mx-auto h-16 w-16 text-slate-700 mb-4 opacity-50" />
                 <p className="text-slate-400 font-medium">Enter a suspect name, vehicle registration, or phone number to mine graph linkages across all live FIRs.</p>
             </div>
         )}
         
         {loading && (
             <div className="text-center z-10 flex flex-col items-center">
                 <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest">Traversing Neo4j Nodes...</p>
             </div>
         )}

         {graphData && graphData.notFound && (
             <div className="text-center z-10 bg-slate-800/80 p-6 rounded-xl border border-slate-700">
                 <p className="text-red-400 font-bold mb-1">Entity Not Found: "{graphData.query}"</p>
                 <p className="text-sm text-slate-400">0 connected degrees across active database.</p>
             </div>
         )}

         {graphData && graphData.entity && (
             <div className="relative w-full h-full animate-[fadeIn_0.5s_ease-out]">
                 {/* Central Node */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                     <div className="h-20 w-20 bg-indigo-600 rounded-full border-4 border-indigo-300 shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center text-white relative group cursor-pointer hover:bg-indigo-500 transition-colors">
                         {graphData.entity.type === 'Suspect' ? <User size={32} /> : <Car size={32} />}
                         
                         {/* Central Node Tooltip */}
                         <div className="absolute top-full mt-2 w-48 bg-slate-800 border border-slate-600 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="font-bold text-indigo-300 mb-1 leading-tight">{graphData.entity.name}</p>
                            <div className="flex justify-between items-center bg-slate-900 rounded px-2 py-1 mt-2">
                                <span className="text-slate-400 uppercase text-[10px]">Risk Score</span>
                                <span className="font-mono text-red-400 font-bold">{graphData.entity.risk_score}/100</span>
                            </div>
                         </div>
                     </div>
                 </div>

                 {/* Connecting Lines (SVG overlay) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                     <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                     <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                     <line x1="50%" y1="50%" x2="30%" y2="80%" stroke="rgba(99,102,241,0.4)" strokeWidth="3" />
                     <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="rgba(99,102,241,0.4)" strokeWidth="3" />
                 </svg>

                 {/* Satellite Node 1 (FIR Case) */}
                 {graphData.linked_cases[0] && (
                     <div className="absolute top-[25%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group cursor-pointer">
                         <div className="h-12 w-12 bg-slate-800 rounded-lg border-2 border-slate-600 flex items-center justify-center text-slate-300 group-hover:border-blue-400 transition-colors">
                             <Shield size={20} />
                         </div>
                         <div className="mt-2 text-center bg-slate-800/90 px-2 py-1 rounded text-white text-xs border border-slate-700 whitespace-nowrap">
                             <p className="font-bold">FIR {graphData.linked_cases[0].fir_id}</p>
                             <p className="text-[10px] text-amber-400">{graphData.linked_cases[0].role}</p>
                         </div>
                     </div>
                 )}

                 {/* Satellite Node 2 (FIR Case) */}
                 {graphData.linked_cases[1] && (
                     <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group cursor-pointer">
                         <div className="h-12 w-12 bg-slate-800 rounded-lg border-2 border-slate-600 flex items-center justify-center text-slate-300 group-hover:border-blue-400 transition-colors">
                             <Shield size={20} />
                         </div>
                         <div className="mt-2 text-center bg-slate-800/90 px-2 py-1 rounded text-white text-xs border border-slate-700 whitespace-nowrap">
                             <p className="font-bold">FIR {graphData.linked_cases[1].fir_id}</p>
                             <p className="text-[10px] text-slate-400">{graphData.linked_cases[1].role}</p>
                         </div>
                     </div>
                 )}
                 
                 {/* Satellite Node 3 (Linked Entity / Phone) */}
                 {graphData.linked_nodes[0] && (
                     <div className="absolute top-[80%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group cursor-pointer">
                         <div className="h-14 w-14 bg-slate-800 rounded-full border-2 border-indigo-400/50 flex items-center justify-center text-indigo-300 group-hover:bg-slate-700 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                             {graphData.linked_nodes[0].includes('Vehicle') ? <Car size={24} /> : <User size={24} />}
                         </div>
                         <p className="mt-2 bg-slate-800/90 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap font-mono">
                             {graphData.linked_nodes[0]}
                         </p>
                     </div>
                 )}

                 {/* Satellite Node 4 (Linked Entity / Phone) */}
                 {graphData.linked_nodes[1] && (
                     <div className="absolute top-[75%] left-[75%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group cursor-pointer">
                         <div className="h-14 w-14 bg-slate-800 rounded-full border-2 border-indigo-400/50 flex items-center justify-center text-indigo-300 group-hover:bg-slate-700 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                             {graphData.linked_nodes[1].includes('Phone') ? <Phone size={24} /> : <User size={24} />}
                         </div>
                         <p className="mt-2 bg-slate-800/90 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap font-mono">
                             {graphData.linked_nodes[1]}
                         </p>
                     </div>
                 )}
             </div>
         )}
      </div>
      
      {/* Legend */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex justify-center gap-6 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500 block"></span> Searched Entity</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-slate-600 block"></span> FIR / Case</div>
          <div className="flex items-center gap-2"><div className="h-0 w-4 border-t-2 border-dashed border-slate-500"></div> Soft Link</div>
          <div className="flex items-center gap-2"><div className="h-0 w-4 border-t-2 border-solid border-indigo-400"></div> Hard Link</div>
      </div>
    </div>
  );
}
