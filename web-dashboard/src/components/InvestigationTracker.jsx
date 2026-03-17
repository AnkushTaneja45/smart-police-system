import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, FileText, CheckCircle, Clock, AlertTriangle, PenTool, Link, PhoneCall, Network, Users, UploadCloud, ShieldCheck } from 'lucide-react';
import { API_BASE_URL, AI_BASE_URL } from '../config';
import DocumentGenerator from './documents/DocumentGenerator';
import DigitalSignature from './documents/DigitalSignature';

export default function InvestigationTracker({ fir, onBack }) {
    const [sops, setSops] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Document Generation State
    const [generatingDocType, setGeneratingDocType] = useState(null);
    const [signingDocId, setSigningDocId] = useState(null);

    // New state variables
    const [showSignaturePad, setShowSignaturePad] = useState(false); // This state variable is added but not used in the provided snippet.
    const [graphAlert, setGraphAlert] = useState(null);
    const [isAnalyzingCdr, setIsAnalyzingCdr] = useState(false);
    const [cdrResult, setCdrResult] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [isScrutinizing, setIsScrutinizing] = useState(false);
    const [scrutinyResult, setScrutinyResult] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const fileInputRef = useRef(null);

    const fetchInvestigationData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch SOPs based on SectionsApplied
                const sections = fir.SectionsApplied || fir.sectionsapplied || 'General';
                const firId = fir.FIRID || fir.firid;
                const sopRes = await fetch(`${API_BASE_URL}/api/sops/${encodeURIComponent(sections)}`, { headers });
                
                // Fetch existing documents
                const docRes = await fetch(`${API_BASE_URL}/api/documents/fir/${firId}`, { headers });

                if (sopRes.ok && docRes.ok) {
                    setSops(await sopRes.json());
                    setDocuments(await docRes.json());
                }
            } catch (err) {
                console.error("Error fetching investigation data:", err);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchInvestigationData();
    }, [fir]);

    // Mock fetching dynamic Graph Linkages based on FIR data
    useEffect(() => {
        const checkLinkages = async () => {
             try {
                // In a real app we would pass all suspect names/phones extracted from FIR.
                // For MVP we just use the suspect 'Ramesh' if he exists in the description.
                const desc = fir.Description || fir.description || "";
                const suspectMatch = desc.toLowerCase().includes('ramesh') ? 'ramesh' : 'unknown';
                
                if (suspectMatch !== 'unknown') {
                    const res = await fetch(`${AI_BASE_URL}/api/ai/fuzzy-search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: suspectMatch, type: 'suspect' })
                    });
                    const data = await res.json();
                    if (data.success && data.entity) {
                        setGraphAlert(data);
                    }
                }
             } catch (err) {
                 console.error("Linkage engine failed", err);
             }
        };

        checkLinkages();
    }, [fir]);

    const handleDocumentGenerated = (docId) => {
        setGeneratingDocType(null);
        setSigningDocId(docId); // Auto-flow to signature
    };

    const handleSignatureSuccess = () => {
        setSigningDocId(null);
        fetchInvestigationData(); // Refresh locker
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const firId = fir.FIRID || fir.firid;
            const formData = new FormData();
            formData.append('firid', firId);
            formData.append('file_name', file.name);
            formData.append('file_type', file.type);
            formData.append('file_size', file.size);
            
            // Note: Since we use express.json over multer in the mock, we simulate passing file metadata
            const res = await fetch(`${API_BASE_URL}/api/evidence/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            const data = await res.json();
            if (data.success) {
                setEvidenceItems(prev => [...prev, data.uploaded_file]);
            }
        } catch (err) {
             console.error("Evidence upload failed:", err);
        } finally {
             setIsUploading(false);
        }
    };
    
    const handleCloseCase = async () => {
         if (!window.confirm("Are you sure you want to close this investigation? This will move it to solved status.")) return;
         
         setIsClosing(true);
         try {
              const firId = fir.FIRID || fir.firid;
              const token = localStorage.getItem('token');
              const res = await fetch(`${API_BASE_URL}/api/cases/firs/close/${firId}`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                  onBack(); // Go back to dashboard on success
              }
         } catch (err) {
              console.error("Close case failed", err);
         } finally {
              setIsClosing(false);
         }
    };

    const handleChallanScrutiny = async () => {
        setIsScrutinizing(true);
        try {
             const firId = fir.FIRID || fir.firid;
             const desc = fir.Description || fir.description || "";
             const res = await fetch(`${AI_BASE_URL}/api/ai/challan-scrutiny`, {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ 
                     fir_id: firId, 
                     content_summary: desc + " " + documents.map(d => d.doctype).join(" ") 
                 })
             });
             const data = await res.json();
             if (data.success) {
                 setScrutinyResult(data);
             }
        } catch (err) {
             console.error("AI Scrutiny Error", err);
        } finally {
             setIsScrutinizing(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-400">Loading case file...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    &larr;
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        FIR #{fir.FIRID || fir.firid} 
                        <span className="text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 truncate max-w-xs">{fir.SectionsApplied || fir.sectionsapplied}</span>
                    </h2>
                    <p className="text-slate-500 mt-1">Status: <span className="font-medium text-slate-700">{fir.Status || fir.status}</span></p>
                </div>
                {(fir.Status || fir.status) !== 'Closed' && (
                    <button 
                        onClick={handleCloseCase}
                        disabled={isClosing}
                        className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isClosing ? 'Closing...' : 'Close Investigation'}
                    </button>
                )}
            </div>

            {/* AI Linkage Alert Banner */}
            {graphAlert && (
                <div className="mx-8 mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-4 animate-[slideDown_0.3s_ease]">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                        <Link size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                             System Alert: Linked Entity Detected
                             <span className="text-[10px] uppercase bg-indigo-600 text-white px-2 py-0.5 rounded leading-none">Neo4j Match</span>
                        </h4>
                        <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
                             Suspect <strong>{graphAlert.entity.name}</strong> identified in this FIR matches <strong className="text-red-600 border-b border-red-300 border-dashed">{graphAlert.linked_cases.length} other active cases</strong> with a risk score of {graphAlert.entity.risk_score}.
                        </p>
                        <div className="flex gap-4 mt-3">
                            <button className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded hover:bg-indigo-700 transition">View Linked Cases</button>
                            <button onClick={() => setGraphAlert(null)} className="text-xs text-indigo-500 font-bold hover:text-indigo-800">Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SOP Checklist Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Standard Operating Procedure ({sops?.caseCategory})</h3>
                            <span className="text-xs font-bold text-police-blue bg-blue-50 px-3 py-1.5 rounded border border-blue-100">
                                Mandated Tasks: {sops?.checklist.length || 0}
                            </span>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-4">
                                {sops?.checklist.map((step, idx) => {
                                    // Check if doc exists for this step
                                    const hasDoc = step.requiresDocument && documents.some(d => (d.DocType || d.doctype) === step.requiresDocument);
                                    
                                    return (
                                    <li key={step.id} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="mt-1 flex-shrink-0">
                                            {hasDoc ? (
                                                <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">✓</div>
                                            ) : (
                                                <div className="h-6 w-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400">{idx + 1}</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-bold ${hasDoc ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{step.title}</h4>
                                                {step.required && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Required</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                                            
                                            {step.requiresDocument && !hasDoc && (
                                                <button 
                                                    onClick={() => setGeneratingDocType(step.requiresDocument)}
                                                    className="mt-4 text-xs font-bold text-white bg-police-blue hover:bg-blue-800 transition-colors px-4 py-2 rounded-lg shadow-sm"
                                                >
                                                    Generate {step.requiresDocument}
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Case Details & Documents Sidebar */}
                <div className="space-y-6">
                    {/* Pre-submission AI Scrutiny Widget */}
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl shadow-lg border border-indigo-500/30 overflow-hidden text-white relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ShieldCheck size={80} />
                        </div>
                        <div className="p-5 relative z-10">
                            <h3 className="font-bold flex items-center gap-2 mb-1">
                                <ShieldCheck size={18} className="text-emerald-400" />
                                AI Challan Scrutiny
                            </h3>
                            <p className="text-xs text-slate-300 mb-4 opacity-80">Pre-check final compilation against Criminal Procedure Codes before Judiciary submission.</p>
                            
                            {!scrutinyResult ? (
                                <button 
                                    onClick={handleChallanScrutiny}
                                    disabled={isScrutinizing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isScrutinizing ? 'Scanning Packet...' : 'Run Scrutiny Check'}
                                </button>
                            ) : (
                                <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4 animate-[fadeIn_0.5s_ease-out]">
                                     <div className="mb-3">
                                          {scrutinyResult.status === 'REJECTED' ? (
                                              <span className="text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded">DEFECTS FOUND</span>
                                          ) : (
                                              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded">ALL CLEAR</span>
                                          )}
                                     </div>
                                     {scrutinyResult.defects.length > 0 ? (
                                         <ul className="space-y-2 mb-3">
                                             {scrutinyResult.defects.map((def, i) => (
                                                 <li key={i} className="text-[10px] text-red-200 flex items-start gap-1.5 leading-snug">
                                                     <AlertTriangle size={12} className="shrink-0 mt-0.5 opacity-80" />
                                                     {def}
                                                 </li>
                                             ))}
                                         </ul>
                                     ) : (
                                         <p className="text-xs text-emerald-300 mb-3">Compliance scan passed. Ready for Court e-Filing.</p>
                                     )}
                                     <div className="flex gap-2">
                                          <button onClick={() => setScrutinyResult(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded transition-colors text-slate-300 border border-slate-700">Dismiss</button>
                                          <button disabled={scrutinyResult.status === 'REJECTED'} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-xs py-1.5 rounded font-bold transition-colors disabled:opacity-30 disabled:grayscale">e-File to Court</button>
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CDR / IPDR Analysis Node */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center group cursor-pointer hover:bg-indigo-50 transition-colors">
                              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                  <PhoneCall className="text-indigo-500" size={16} /> 
                                  CDR / IPDR Analysis
                              </h3>
                              {cdrResult ? (
                                  <button onClick={(e) => { e.stopPropagation(); setCdrResult(null); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-700">CLEAR</button>
                              ) : (
                                  <button 
                                     onClick={async (e) => {
                                         e.stopPropagation();
                                         setIsAnalyzingCdr(true);
                                         try {
                                             const res = await fetch(`${AI_BASE_URL}/api/ai/analyze-cdr`, {
                                                 method: 'POST',
                                                 headers: {'Content-Type': 'application/json'},
                                                 body: JSON.stringify({ phone_number: '9988776655' })
                                             });
                                             const data = await res.json();
                                             if (data.success) setCdrResult(data);
                                         } catch (err) { console.error("CDR Error", err); }
                                         setIsAnalyzingCdr(false);
                                     }}
                                     disabled={isAnalyzingCdr}
                                     className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded shadow-sm hover:bg-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                  >
                                     {isAnalyzingCdr ? 'Mining...' : <><Network size={12} /> Mine Data</>}
                                  </button>
                              )}
                         </div>

                         {/* CDR Results View */}
                         {cdrResult && (
                             <div className="p-5 bg-slate-900 text-white animate-[slideDown_0.3s_ease]">
                                 <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
                                     <div>
                                         <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-1">Target Number</span>
                                         <h4 className="font-bold text-indigo-300">{cdrResult.target_number}</h4>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-1">Logs Analyzed</span>
                                         <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{cdrResult.total_calls_analyzed}</span>
                                     </div>
                                 </div>

                                 <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mb-4 flex items-start gap-3">
                                     <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
                                     <div>
                                         <span className="block text-[10px] uppercase font-bold text-red-400 mb-0.5">AI Flagged Pattern</span>
                                         <p className="text-xs text-red-200 leading-snug">{cdrResult.pattern_detected}</p>
                                     </div>
                                 </div>

                                 <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">Top Frequent Contacts</h5>
                                 <div className="space-y-2">
                                     {cdrResult.top_contacts.map((contact, idx) => (
                                         <div key={idx} className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-700">
                                             <div className="flex items-center gap-3">
                                                 <div className="h-8 w-8 rounded bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                                     <Users size={14} />
                                                 </div>
                                                 <div>
                                                     <p className="font-mono text-sm font-bold text-slate-200">{contact.number}</p>
                                                     <p className={`text-[10px] font-bold ${contact.risk.includes('High') ? 'text-red-400' : 'text-slate-400'}`}>
                                                         {contact.risk}
                                                     </p>
                                                 </div>
                                             </div>
                                             <div className="text-right shrink-0">
                                                 <p className="text-sm font-bold text-indigo-300">{contact.calls}</p>
                                                 <p className="text-[10px] text-slate-500 uppercase">Pings</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </div>

                    {/* Case Facts Preview */}
                    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </div>
                         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Initial Complaint Details</h3>
                         <p className="text-sm leading-relaxed mb-4 text-slate-300">{fir.Description || fir.description}</p>
                         <div className="text-xs text-slate-400 font-mono pt-4 border-t border-slate-800">
                             Reported: {new Date(fir.CreatedAt || fir.createdat).toLocaleString()}
                         </div>
                    </div>

                    {/* Generated Documents Locker */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Documents</h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {documents.length === 0 ? (
                                <li className="px-6 py-8 text-center text-sm text-slate-400 italic">No formal documents generated yet.</li>
                            ) : (
                                documents.map(doc => (
                                    <li key={doc.docid} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-50 text-indigo-500 rounded flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{doc.DocType || doc.doctype}</p>
                                                <p className="text-xs text-slate-400">{new Date(doc.CreatedAt || doc.createdat).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            { (doc.SignedStatus || doc.signedstatus) ? (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Signed</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Draft</span>
                                            )}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    
                    {/* Media Evidence Locker */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Locker</h3>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-xs font-bold text-police-blue flex items-center gap-1 hover:text-blue-800 transition-colors disabled:opacity-50"
                            >
                                {isUploading ? "Uploading..." : <><UploadCloud size={14} /> Upload Media</>}
                            </button>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {evidenceItems.length === 0 ? (
                                <li className="px-6 py-6 text-center text-sm text-slate-400 italic">No media evidence uploaded.</li>
                            ) : (
                                evidenceItems.map((item, idx) => (
                                    <li key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded flex items-center justify-center shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div className="truncate flex-1 pr-4">
                                                <p className="font-bold text-xs text-slate-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-slate-400">{(item.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <div className="shrink-0">
                                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 font-mono">HASHED</span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {generatingDocType && (
                <DocumentGenerator 
                    fir={fir} 
                    docType={generatingDocType} 
                    onCancel={() => setGeneratingDocType(null)}
                    onGenerate={handleDocumentGenerated}
                />
            )}

            {signingDocId && (
                <DigitalSignature 
                    docId={signingDocId}
                    onCancel={() => setSigningDocId(null)}
                    onSuccess={handleSignatureSuccess}
                />
            )}
        </div>
    );
}
