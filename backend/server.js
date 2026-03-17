const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const documentRoutes = require('./routes/documents');
const sopRoutes = require('./routes/sops');

const app = express();
const PORT = process.env.PORT || 5000;

const db = require('./db');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/sops', sopRoutes);

// Static files for Frontend
app.use(express.static(path.join(__dirname, '../web-dashboard/dist')));

// Documents APIs
app.get('/api/documents/fir/:firid', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM Documents WHERE FIRID = $1 ORDER BY CreatedAt DESC", [req.params.firid]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const { firid, doctype } = req.body;
        const result = await db.query("INSERT INTO Documents (FIRID, DocType) VALUES ($1, $2)", [firid, doctype]);
        res.json({ success: true, docid: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents/:docid/sign', async (req, res) => {
    try {
        await db.query("UPDATE Documents SET SignedStatus = 1 WHERE DocID = $1", [req.params.docid]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Evidence Upload Mock API
// In production, we would use 'multer' to stream to an S3 bucket.
app.post('/api/evidence/upload', express.json({limit: '50mb'}), (req, res) => {
    const { firid, file_name, file_type, file_size } = req.body;
    
    if (!firid) return res.status(400).json({ error: "FIRID required" });

    // Mock an artificial 1 second delay for uploading
    setTimeout(() => {
        res.json({
            success: true,
            evidence_id: Math.floor(Math.random() * 10000),
            message: "File successfully hashed and uploaded to secure evidence locker.",
            uploaded_file: { name: file_name, type: file_type, size: file_size },
            hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        });
    }, 1000);
});

app.get('/api/health', async (req, res) => {
    const dbStatus = db.getDbStatus();
    try {
        const officerCount = await db.query("SELECT COUNT(*) as count FROM Officers");
        const count = officerCount.rows[0].count;
        res.json({ 
            status: 'ok', 
            dbStatus,
            officer_count: count,
            message: 'Smart Police System API MVP running - VERIFIED_ID_12345' 
        });
    } catch (err) {
        res.json({ 
            status: 'partial', 
            dbStatus,
            db_query_error: err.message, 
            message: 'API running but DB issue.' 
        });
    }
});

// Fallback for SPA (React)
// Fallback for SPA (React)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../web-dashboard/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
