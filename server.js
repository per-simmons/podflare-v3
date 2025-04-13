const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);
    
    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Handle POST requests (form submissions)
    if (req.method === 'POST') {
        console.log('Received POST request');
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Form data received:', body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
        
        return;
    }
    
    // Default to index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Get absolute path - use __dirname to get the current directory
    const absolutePath = path.join(__dirname, filePath);
    console.log(`Looking for file at: ${absolutePath}`);

    // Get the file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    // Map file extensions to content types
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
    }

    // Read the file
    fs.readFile(absolutePath, (err, content) => {
        if (err) {
            console.error(`Error reading file: ${err.code}`);
            
            if (err.code === 'ENOENT') {
                // Page not found
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    if (err) {
                        console.error(`Error reading index.html: ${err}`);
                        res.writeHead(500);
                        res.end('Server Error: Could not find index.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`To debug in browser, open http://localhost:${PORT}/ and open developer tools (F12)`);
}); 