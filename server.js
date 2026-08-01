/**
 * @fileoverview Native Node.js HTTP server. Serves the Context Hub UI and the AI context API.
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { bundleContext } = require('./bundler.js');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
};

const server = http.createServer(async (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // CORS Headers for agentic IDEs to access the API remotely if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    try {
        // API Route: Generate Context
        if (req.url === '/api/context' && req.method === 'GET') {
            const contextXml = await bundleContext();
            res.writeHead(200, { 'Content-Type': 'application/xml', 'Cache-Control': 'no-store' });
            return res.end(contextXml);
        }

        // API Route: Serve llms.txt standard
        if (req.url === '/llms.txt' || req.url === '/api/llms.txt') {
            const llmsText = await fs.readFile(path.join(__dirname, 'llms.txt'), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end(llmsText);
        }

        // Static File Routing
        let filePath = req.url === '/' ? '/index.html' : req.url;
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';
        const absolutePath = path.join(__dirname, filePath);

        const content = await fs.readFile(absolutePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);

    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
        }
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Context Hub is running on http://localhost:${PORT}`);
    console.log(`🤖 AI Context Endpoint: http://localhost:${PORT}/api/context`);
});