const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
const db = require('./db/index');

const path = require('path');

// Resume/CV download route
app.get('/download/:type/:filename', (req, res) => {
  const { type, filename } = req.params; // type = 'resume' or 'cv'

  // Validate type
  if (!['resume', 'cv'].includes(type)) {
    return res.status(400).send('Invalid file type');
  }

  // Build the absolute path to the file
  const filePath = path.join(__dirname, 'public', type, filename);

  // Send file with Content-Disposition: attachment
  res.download(filePath, filename, err => {
    if (err) {
      console.error('File download error:', err);
      res.status(500).send('File download failed');
    }
  });
});

const routes = require('./Routes/index');
app.use('/api', routes);
app.use('/public', express.static('public'));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('server is running ..');
});
