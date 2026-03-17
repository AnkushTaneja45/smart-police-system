const express = require('express');
const db = require('../db');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all documents for an FIR
router.get('/fir/:firId', verifyToken, async (req, res) => {
    try {
        const { firId } = req.params;
        const result = await db.query('SELECT * FROM Documents WHERE FIRID = $1 ORDER BY CreatedAt DESC', [firId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching documents' });
    }
});

// Generate/Save a new document
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { firId, docType, generatedData } = req.body;
        
        // Ensure FIR exists
        const firCheck = await db.query('SELECT * FROM FIRs WHERE FIRID = $1', [firId]);
        if (!firCheck.rows || firCheck.rows.length === 0) {
            return res.status(404).json({ error: 'FIR not found' });
        }

        const query = `
            INSERT INTO Documents (FIRID, DocType, GeneratedData)
            VALUES ($1, $2, $3)
        `;
        
        const result = await db.query(query, [firId, docType, JSON.stringify(generatedData)]);
        
        res.status(201).json({ 
            message: 'Document generated successfully', 
            docId: result.lastID || (result.rows && result.rows[0] ? result.rows[0].id : null) 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error generating document' });
    }
});

// Sign a document (Mock Digital Signature)
router.post('/sign/:docId', verifyToken, async (req, res) => {
    try {
        const { docId } = req.params;
        const { signatureData, pin } = req.body;
        
        // Mock PIN verification
        if (pin !== '1234' && pin !== 'password') {
            return res.status(401).json({ error: 'Invalid PIN signature rejected' });
        }

        const query = `
            UPDATE Documents 
            SET SignedStatus = 1, SignedBy = $1, SignaturePath = $2
            WHERE DocID = $3
        `;
        
        await db.query(query, [req.user.name, signatureData, docId]);
        res.json({ message: 'Document signed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error signing document' });
    }
});

module.exports = router;
