const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);
    
    // Handle root and YouTube Thumbnail Downloader main page
    if (req.url === '/youtube-thumbnail-downloader' || req.url === '/youtube-thumbnail-downloader/') {
        fs.readFile(path.join(__dirname, 'youtube-thumbnail', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(`Error: ${err.code}`);
                return;
            }
            
            // Fix for paths in HTML - replace relative paths with absolute paths
            let htmlContent = content.toString();
            htmlContent = htmlContent.replace(/href="static\//g, 'href="/youtube-thumbnail-downloader/static/');
            htmlContent = htmlContent.replace(/src="static\//g, 'src="/youtube-thumbnail-downloader/static/');
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        });
        return;
    }
    
    // Handle static files in the youtube-thumbnail directory
    if (req.url.startsWith('/youtube-thumbnail-downloader/static/')) {
        const filePath = req.url.replace('/youtube-thumbnail-downloader/static/', 'youtube-thumbnail/static/');
        serveStaticFile(filePath, res);
        return;
    }
    
    // Also handle direct /static/ requests from the youtube-thumbnail folder
    if (req.url.startsWith('/static/')) {
        // Try both youtube-thumbnail/static/ and static/ paths
        const ytFilePath = path.join('youtube-thumbnail', req.url);
        fs.access(ytFilePath, fs.constants.F_OK, (err) => {
            if (!err) {
                serveStaticFile(ytFilePath, res);
            } else {
                // Fallback to direct static path
                serveStaticFile(req.url.substring(1), res);
            }
        });
        return;
    }
    
    // Default: serve files from the root
    let filePath = req.url === '/' ? 'index.html' : req.url.substring(1);
    serveStaticFile(filePath, res);
});

function serveStaticFile(filePath, res) {
    const extname = path.extname(filePath).toLowerCase();
    
    // Default content type
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
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
    }
    
    // Read and serve the file
    fs.readFile(path.join(__dirname, filePath), (err, content) => {
        if (err) {
            console.log(`Error reading file ${filePath}: ${err.code}`);
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end(`File not found: ${filePath}`);
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            console.log(`Successfully served ${filePath} as ${contentType}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
}); 