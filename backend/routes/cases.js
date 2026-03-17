const express = require('express');
const db = require('../db');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all complaints for the station (SHO dashboard)
router.get('/complaints', verifyToken, async (req, res) => {
    try {
        // In real life, filter by req.user.stationId
        const result = await db.query('SELECT * FROM Complaints ORDER BY CreatedAt DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new complaint (Beat Officer Mobile App Sync) - no auth needed
router.post('/complaints', async (req, res) => {
    try {
        const { complainantName, mobile, address, gps, description, incidentDateTime } = req.body;
        const query = `
            INSERT INTO Complaints (ComplainantName, ComplainantMobile, Address, IncidentGPS, Description, IncidentDateTime)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [complainantName, mobile, address, gps, description, incidentDateTime];
        const result = await db.query(query, values);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Close an FIR
router.post('/firs/close/:firId', verifyToken, async (req, res) => {
    try {
        const { firId } = req.params;
        await db.query("UPDATE FIRs SET Status = 'Closed', UpdatedAt = CURRENT_TIMESTAMP WHERE FIRID = $1", [firId]);
        res.json({ message: 'Investigation closed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get FIRs assigned to IO
router.get('/firs', verifyToken, async (req, res) => {
    try {
        let queryStr = `
            SELECT f.*, c.ComplainantName, c.Description, o.Name as AssignedIOName 
            FROM FIRs f
            JOIN Complaints c ON f.ComplaintID = c.ComplaintID
            LEFT JOIN Officers o ON f.AssignedIO = o.OfficerID
        `;
        let values = [];

        if (req.user.rank === 'IO') {
            queryStr += ' WHERE f.AssignedIO = $1';
            values.push(req.user.officerId);
        }

        queryStr += ' ORDER BY f.CreatedAt DESC';

        const result = await db.query(queryStr, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Assign IO to a complaint (converts to FIR)
router.post('/assign-io', verifyToken, async (req, res) => {
    try {
        const { complaintId, ioId, sections } = req.body;
        
        // Mark complaint as ConvertedToFIR
        await db.query('UPDATE Complaints SET Status = $1 WHERE ComplaintID = $2', ['ConvertedToFIR', complaintId]);
        
        // Create FIR
        const query = `
            INSERT INTO FIRs (ComplaintID, AssignedIO, SectionsApplied, Status, ChargesheetDeadline)
            VALUES ($1, $2, $3, $4, date('now', '+30 days')) RETURNING *
        `;
        const result = await db.query(query, [complaintId, ioId, sections, 'Under Investigation']);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all IOs for assignment
router.get('/officers', verifyToken, async (req, res) => {
    try {
        const result = await db.query("SELECT OfficerID, Name, Rank FROM Officers WHERE Rank = 'IO' OR Rank = 'SHO'");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
