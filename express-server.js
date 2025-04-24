const express = require('express');
const path = require('path');
const app = express();

// Main route for the youtube-thumbnail-downloader page
app.get('/youtube-thumbnail-downloader', (req, res) => {
  res.sendFile(path.join(__dirname, '/youtube-thumbnail/index.html'));
});

// Serve the static files from youtube-thumbnail directory
app.use('/youtube-thumbnail-downloader/static', express.static(path.join(__dirname, 'youtube-thumbnail/static')));

// Also serve static files at the root /static path for compatibility
app.use('/static', express.static(path.join(__dirname, 'youtube-thumbnail/static')));

// Serve all other static files from root
app.use(express.static('./'));

// Catch all other paths within youtube-thumbnail-downloader and redirect to the proper youtube-thumbnail folder
app.get('/youtube-thumbnail-downloader/*', (req, res) => {
  const requestPath = req.path.replace('/youtube-thumbnail-downloader/', '');
  res.sendFile(path.join(__dirname, 'youtube-thumbnail', requestPath));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
}); 