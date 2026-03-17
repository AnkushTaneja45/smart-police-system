import React, { useState } from 'react';
import API_BASE_URL from '../../config';

export default function DocumentGenerator({ fir, docType, onCancel, onGenerate }) {
    const [generating, setGenerating] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [docData, setDocData] = useState({});

    // MOCK: Generate document logic
    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            // Mock AI or template extraction filling in fields
            setDocData({
                 firNum: fir.FIRID || fir.firid,
                 station: '101',
                 date: new Date().toLocaleDateString(),
                 time: new Date().toLocaleTimeString(),
                 accusedName: 'Ramesh Kumar (Mock)',
                 ioName: 'Sample IO Name',
                 sections: fir.SectionsApplied || fir.sectionsapplied,
                 observations: '',
                 witnessName: '',
                 statement: ''
            });
            setGenerating(false);
            setPreviewing(true);
        }, 1500);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/documents/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firId: fir.FIRID || fir.firid,
                    docType: docType,
                    generatedData: docData
                })
            });

            if (res.ok) {
                const data = await res.json();
                onGenerate(data.docId); // Pass control back to parent or Signature screen
            } else {
                alert("Failed to save document to DB.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderInputFields = () => {
        if (docType.includes('Site Visit') || docType.includes('Crime Scene')) {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Observations / Findings</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-police-blue outline-none min-h-[120px]"
                            placeholder="Describe what was found at the scene... (e.g., broken glass, footprints, position of items)"
                            value={docData.observations}
                            onChange={(e) => setDocData({...docData, observations: e.target.value})}
                        />
                    </div>
                </div>
            );
        }
        if (docType.includes('Witness Statement')) {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Witness Name</label>
                        <input 
                            type="text"
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-police-blue outline-none"
                            placeholder="Name of the person making the statement"
                            value={docData.witnessName}
                            onChange={(e) => setDocData({...docData, witnessName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Statement Details</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-police-blue outline-none min-h-[150px]"
                            placeholder="Record the direct testimony here..."
                            value={docData.statement}
                            onChange={(e) => setDocData({...docData, statement: e.target.value})}
                        />
                    </div>
                </div>
            );
        }
        return <p className="text-slate-500 italic">No additional input required for this template. Proceed to preview.</p>;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease]">
                
                {/* Header */}
                <div className="px-6 py-4 bg-police-dark text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight">Automated {docType}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {!previewing ? (
                    <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-police-blue">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Prepare {docType}</h3>
                            <p className="text-slate-500 max-w-md mx-auto">The system will automatically extract facts from FIR #{fir.firid} and the CCTNS database to populate the standard legal template.</p>
                        </div>
                        
                        <div className="w-full text-left">
                            {renderInputFields()}
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={generating}
                            className={`w-64 py-3 rounded-lg font-bold text-white transition-all shadow-md ${generating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                        >
                            {generating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Assembling Template...
                                </span>
                            ) : `Auto-Fill Template`}
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                        {/* Print Preview Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="bg-white mx-auto shadow-sm border border-slate-200 p-8 min-h-[500px] font-serif text-slate-800 relative">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                    <h1 className="text-6xl font-black rotate-[-45deg] whitespace-nowrap">HARYANA POLICE</h1>
                                </div>
                                
                                <h1 className="text-center font-bold text-xl uppercase mb-1">{docType}</h1>
                                <p className="text-center text-sm mb-8">(Under Section xyz of CrPC/BNS)</p>

                                <div className="space-y-4 text-justify">
                                    <p>FIR No. <span className="font-bold border-b border-slate-300 px-2">{docData.firNum}</span> dated <span className="font-bold border-b border-slate-300 px-2">{docData.date}</span> at Police Station <span className="font-bold border-b border-slate-300 px-2">{docData.station}</span> under sections <span className="font-bold border-b border-slate-300 px-2">{docData.sections}</span>.</p>
                                    
                                    <p className="indent-8">
                                        Today on <span className="font-bold px-1">{docData.date}</span> at about <span className="font-bold px-1">{docData.time}</span>, during the investigation of the above-mentioned case, I am recording the following as part of the official {docType}:
                                    </p>

                                    {docData.observations && (
                                        <div className="bg-slate-50 p-4 border-l-4 border-indigo-500 my-4">
                                            <p className="font-bold text-xs uppercase text-slate-500 mb-2">Observations at Site:</p>
                                            <p>{docData.observations}</p>
                                        </div>
                                    )}

                                    {docData.statement && (
                                        <div className="bg-slate-50 p-4 border-l-4 border-police-blue my-4 italic">
                                            <p className="font-bold text-xs uppercase text-slate-500 mb-2 font-serif not-italic">Statement of {docData.witnessName}:</p>
                                            <p>"{docData.statement}"</p>
                                        </div>
                                    )}

                                    <p className="indent-8">The details mentioned above have been verified as far as possible on the spot. I have informed all concerned parties of their rights and legal requirements. A copy of this memo has been prepared for the case file.</p>
                                </div>

                                <div className="mt-16 flex justify-between px-4">
                                     <div className="text-center space-y-8">
                                         <div className="w-32 h-16 border-b-2 border-dashed border-slate-300"></div>
                                         <p className="text-sm font-bold">Signature of Accused/Witness</p>
                                     </div>
                                     <div className="text-center space-y-8 flex flex-col items-end">
                                         <div className="w-32 h-16 border-b-2 border-dashed border-slate-300 relative group flex items-end justify-center pb-1 text-xs text-slate-400">
                                            [Digital Hash Pending]
                                         </div>
                                         <p className="text-sm font-bold">Investigating Officer</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Footer */}
                        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                            <button onClick={onCancel} className="px-5 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Discard</button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Save Draft & Proceed to e-Sign
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
