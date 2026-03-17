const express = require('express');
const { verifyToken } = require('./auth');
const router = express.Router();

// Mock SOP Database
const SOPS = {
    'NDPS': [
        { id: 'ndps-1', title: 'Verify Information', desc: 'Entry in Daily Diary (DD) regarding secret information received.', required: true },
        { id: 'ndps-2', title: 'Section 42 Compliance', desc: 'Forward information to superior officer within 72 hours.', required: true },
        { id: 'ndps-3', title: 'Section 50 Notice', desc: 'Inform suspect of their right to be searched before a Gazetted Officer/Magistrate.', required: true, requiresDocument: 'Section 50 Notice' },
        { id: 'ndps-4', title: 'Seizure Memo', desc: 'Prepare detailed memo of recovered contraband on the spot.', required: true, requiresDocument: 'Seizure Memo' },
        { id: 'ndps-5', title: 'Arrest Memo', desc: 'Prepare arrest memo, inform relatives.', required: true, requiresDocument: 'Arrest Memo' },
        { id: 'ndps-6', title: 'FSL Sampling', desc: 'Draw two representative samples of 24 grams each (or appropriate amount) and seal.', required: true }
    ],
    'Theft': [
        { id: 'theft-1', title: 'Examine Crime Scene', desc: 'Take photographs, protect evidence.', required: true, requiresDocument: 'Crime Scene Report' },
        { id: 'theft-2', title: 'Record Statements', desc: 'Record statement of complainant under Section 161.', required: true, requiresDocument: 'Witness Statement' },
        { id: 'theft-3', title: 'CCTV Search', desc: 'Identify and secure CCTV footage in the vicinity.', required: false },
        { id: 'theft-4', title: 'Seizure/Recovery', desc: 'Seize stolen property if recovered.', required: false, requiresDocument: 'Recovery Memo' }
    ]
};

router.get('/:caseType', verifyToken, (req, res) => {
    try {
        const { caseType } = req.params;
        
        // Use regex/fuzzy match for case type since it might be embedded in the sections (e.g. 'BNS 303(2) (Theft)')
        let matchedKey = null;
        for (const key of Object.keys(SOPS)) {
            if (caseType.toLowerCase().includes(key.toLowerCase())) {
                matchedKey = key;
                break;
            }
        }

        if (matchedKey) {
            res.json({ caseCategory: matchedKey, checklist: SOPS[matchedKey] });
        } else {
            // Default generic checklist
            res.json({ 
                caseCategory: 'General', 
                checklist: [
                    { id: 'gen-1', title: 'Initial Site Visit', desc: 'Visit the scene of the crime.', required: true, requiresDocument: 'Site Visit Report' },
                    { id: 'gen-2', title: 'Witness Statements', desc: 'Record statements of material witnesses.', required: true, requiresDocument: 'Witness Statement' },
                    { id: 'gen-3', title: 'Arrest Suspects', desc: 'Apprehend accused if evidence is sufficient.', required: false, requiresDocument: 'Arrest Memo' }
                ] 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching SOPs' });
    }
});

module.exports = router;
