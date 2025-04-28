const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Special routes for CSS and JS files 
app.get('/app/styles/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'styles', req.params.file));
});

app.get('/app/assets/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'assets', req.params.file));
});

app.get('/app/js/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'js', req.params.file));
});

app.get('/app/components/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'components', req.params.file));
});

// Route for image assets
app.get('/image assets/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'image assets', req.params.file));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 