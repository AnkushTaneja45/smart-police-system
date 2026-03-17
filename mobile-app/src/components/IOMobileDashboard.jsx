import React, { useState } from 'react';

export default function IOMobileDashboard({ user, onLogout }) {
    const [view, setView] = useState('cases'); // 'cases', 'form', 'sign'
    const [activeDoc, setActiveDoc] = useState(null);
    const [signature, setSignature] = useState('');

    const forms = [
        { id: 'f1', type: 'Arrest Memo', relatedFir: 'FIR #102' },
        { id: 'f2', type: 'Seizure Memo', relatedFir: 'FIR #102' },
        { id: 'f3', type: 'Site Plan', relatedFir: 'FIR #104' }
    ];

    const startForm = (form) => {
        setActiveDoc(form);
        setView('form');
    };

    const handleGenerateMock = () => {
        setTimeout(() => {
            setView('sign');
        }, 1200);
    };

    const submitSignature = () => {
        // Mock submission
        setTimeout(() => {
            alert('Document Hash Signed & Secured to Blockchain/DB.');
            setView('cases');
            setActiveDoc(null);
        }, 800);
    };

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-police-dark text-white p-4 pt-12 shadow-md shrink-0 sticky top-0 z-20">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        {view === 'cases' ? 'My Active Cases' : view === 'form' ? 'Generate Memo' : 'e-Sign Pad'}
                    </h1>
                    <button onClick={onLogout} className="text-blue-300 text-xs font-semibold px-2 py-1 border border-blue-400/30 rounded">Logout</button>
                </div>
                <p className="text-xs text-blue-200">Investigating Officer: {user.name}</p>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative">
                {view === 'cases' && (
                    <div className="p-4 space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Field Forms</h2>
                        {forms.map(form => (
                            <div key={form.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{form.type}</h3>
                                    <span className="text-xs font-bold text-police-blue bg-blue-50 px-2 py-1 rounded border border-blue-100">{form.relatedFir}</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">Pending generation at scene.</p>
                                <button 
                                    onClick={() => startForm(form)}
                                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl transition-transform active:scale-95"
                                >
                                    Start Generation
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'form' && (
                    <div className="p-4 flex flex-col items-center justify-center min-h-[500px] text-center">
                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{activeDoc.type}</h2>
                        <p className="text-sm text-slate-500 mb-8 max-w-[250px]">Auto-filling {activeDoc.relatedFir} data into legal template. Proceed when ready.</p>
                        
                        <div className="w-full space-y-3">
                            <button 
                                onClick={handleGenerateMock}
                                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition-transform active:scale-95"
                            >
                                Generate & Review
                            </button>
                            <button 
                                onClick={() => setView('cases')}
                                className="w-full bg-slate-200 text-slate-600 font-bold py-4 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {view === 'sign' && (
                     <div className="p-4 h-full flex flex-col">
                         <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
                             <h3 className="text-sm font-bold uppercase text-slate-400">Preview</h3>
                             <p className="mt-2 text-sm leading-relaxed" style={{ filter: 'blur(0.5px)'}}>
                                 ...It is certified that today during the investigation of {activeDoc.relatedFir}, I am executing this {activeDoc.type} according to standard procedures...
                             </p>
                         </div>

                         <div className="flex-1 bg-white rounded-xl border-2 border-slate-300 border-dashed flex flex-col items-center justify-center p-4 relative mb-4">
                             <h4 className="absolute top-4 left-0 w-full text-center text-slate-400 font-bold uppercase text-xs">Digital Signature Pad</h4>
                             {signature ? (
                                <p className="font-mono text-xl text-police-blue border-b-2 border-police-blue italic px-4 py-2">{signature}</p>
                             ) : (
                                <p className="text-slate-300 my-10 italic">Officer e-Sign Required</p>
                             )}
                             
                             <input 
                                type="text"
                                placeholder="Type Name to Sign"
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="absolute bottom-4 left-4 right-4 text-center p-3 border border-emerald-200 focus:border-emerald-500 rounded-lg bg-emerald-50 text-emerald-900 placeholder-emerald-300 font-bold outline-none"
                             />
                         </div>

                         <div className="grid grid-cols-2 gap-3 shrink-0">
                            <button onClick={() => setView('form')} className="bg-slate-200 text-slate-700 font-bold py-4 rounded-xl">Back</button>
                            <button 
                                onClick={submitSignature}
                                disabled={!signature}
                                className={`font-bold py-4 rounded-xl text-white transition-all ${signature ? 'bg-police-blue shadow-lg' : 'bg-slate-400 opacity-50'}`}
                            >
                                Authenticate
                            </button>
                         </div>
                     </div>
                )}
            </main>
        </div>
    );
}
