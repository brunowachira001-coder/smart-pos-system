const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'contacts.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database table
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'new'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Contacts table ready');
        }
    });
}

// API Endpoint: Submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email address' 
        });
    }

    // Insert into database
    db.run(
        `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
        [name, email, subject, message],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error saving contact' 
                });
            }

            console.log(`New contact saved: ${name} (${email})`);
            res.json({ 
                success: true, 
                message: 'Thank you! We\'ll get back to you within 24 hours',
                id: this.lastID
            });
        }
    );
});

// API Endpoint: Get all contacts (for admin dashboard)
app.get('/api/contacts', (req, res) => {
    db.all(`SELECT * FROM contacts ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error fetching contacts' });
        }
        res.json({ success: true, data: rows });
    });
});

// API Endpoint: Get contact by ID
app.get('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM contacts WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error fetching contact' });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        res.json({ success: true, data: row });
    });
});

// API Endpoint: Update contact status
app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run(
        `UPDATE contacts SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Error updating contact' });
            }
            res.json({ success: true, message: 'Contact updated' });
        }
    );
});

// API Endpoint: Delete contact
app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;

    db.run(
        `DELETE FROM contacts WHERE id = ?`,
        [id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Error deleting contact' });
            }
            res.json({ success: true, message: 'Contact deleted' });
        }
    );
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Contact form API: POST http://localhost:${PORT}/api/contact`);
    console.log(`✓ View contacts: GET http://localhost:${PORT}/api/contacts`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
