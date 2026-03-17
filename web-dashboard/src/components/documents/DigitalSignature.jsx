import React, { useState } from 'react';
import API_BASE_URL from '../../config';

export default function DigitalSignature({ docId, onSuccess, onCancel }) {
    const [pin, setPin] = useState('');
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState('');

    const handleSign = async () => {
        if (!pin) {
            setError('Please enter your 4-digit Authorization PIN');
            return;
        }

        setSigning(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/documents/sign/${docId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    signatureData: 'Aadhaar_eSign_Hash_Mock_' + Math.random().toString(36).substring(7),
                    pin: pin
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Signature verification failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error during signature process.');
        } finally {
            setSigning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                <div className="bg-emerald-600 p-6 flex flex-col items-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white text-center">Secure e-Signature</h2>
                    <p className="text-emerald-100 text-sm mt-1 text-center">Document Authorization required.</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 text-center">
                        <p>You are about to cryptographically sign Document ID <span className="font-bold text-slate-800">#{docId}</span>.</p>
                        <p className="mt-2 text-xs">This action is legally binding and will be recorded in the Chain of Custody ledger.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Enter Department PIN</label>
                        <input 
                            type="password" 
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full text-center text-2xl tracking-[0.5em] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                            placeholder="****"
                        />
                        {error && <p className="text-red-500 text-xs mt-2 font-medium text-center">{error}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={onCancel}
                            disabled={signing}
                            className="bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSign}
                            disabled={signing}
                            className={`font-bold py-3 rounded-lg text-white transition-all shadow-md ${signing ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'}`}
                        >
                            {signing ? 'Verifying...' : 'Authorize'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
