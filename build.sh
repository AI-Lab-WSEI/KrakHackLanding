#!/bin/bash

# Install dependencies
npm install

# Build the Next.js application
npm run build

# Copy build output to the desired directory
mkdir -p public_html
cp -R build/. public_html/

# Create a basic server
cat > server.js << 'EOL'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIRECTORY = path.join(__dirname, 'public_html');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Handle root URL
  let filePath = req.url === '/' 
    ? path.join(DIRECTORY, 'index.html')
    : path.join(DIRECTORY, req.url);

  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Set the default content type
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If the file is not found, try adding .html extension
      if (error.code === 'ENOENT' && !extname) {
        fs.readFile(`${filePath}.html`, (err, content) => {
          if (err) {
            // If still not found, serve the 404 page
            fs.readFile(path.join(DIRECTORY, '404.html'), (err, content) => {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(content || 'Page not found', 'utf-8');
            });
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // For other errors, serve the 500 page
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('Server Error: ' + error.code, 'utf-8');
      }
    } else {
      // No error, serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
EOL

echo "Build completed! You can start the server with 'node server.js'" 