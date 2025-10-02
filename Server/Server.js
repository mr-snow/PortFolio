const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
const db = require('./db/index');

const routes = require('./Routes/index');
app.use('/api', routes);
app.use('/public',express.static('public'))

// app.get('/', (req, res) => {
//   return res.status(200).json({ message: 'Api Call success' });
// });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('server is running ..');
});
