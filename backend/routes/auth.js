const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Secret from ENV if available
const JWT_SECRET = process.env.JWT_SECRET || 'smart_police_super_secret_key';

router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        
        // In reality we would check hashed passwords.
        // For MVP, we'll just check if the user exists based on our seed data logic
        const query = 'SELECT OfficerID, Name, Rank, StationID, PasswordHash FROM Officers WHERE Mobile = $1';
        const result = await db.query(query, [mobile]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: `Officer not found. (Mobile: ${mobile})` });
        }
        
        const user = result.rows[0];
        const passwordHash = user.PasswordHash || user.passwordhash;
        
        // MVP: Simple password check
        let isMatch = false;
        if (password === 'password' || passwordHash === password) {
            isMatch = true;
        }
        
        if (!isMatch) {
             return res.status(401).json({ error: 'Incorrect password. Please verify your mock credentials.' });
        }

        const officerId = user.OfficerID || user.officerid;
        const rank = user.Rank || user.rank;
        const stationId = user.StationID || user.stationid;
        const name = user.Name || user.name;
        
        const token = jwt.sign(
            { officerId, rank, stationId, name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: officerId, name, rank, stationId } });
        
    } catch (err) {
        console.error("Login API Error:", err);
        const { isInitialized, dbInitError } = db.getDbStatus();
        let message = 'Internal Server Error. Please contact support.';
        
        if (!isInitialized) {
            message = `Database initialization in progress or failed: ${dbInitError || 'Unknown Init Error'}`;
        } else if (err.message && err.message.toLowerCase().includes('relation "officers" does not exist')) {
            message = 'Database table "Officers" is missing. Please run the seeding script on your Render database.';
        } else {
            message = `Internal Server Error: ${err.message}`;
        }
        
        res.status(500).json({ error: message });
    }
});

// Middleware to verify token for protected routes
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
