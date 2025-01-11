const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();

app.use('/views', express.static(path.join(__dirname, 'views')));


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Serve HTML Files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
