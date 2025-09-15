
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { parse } = require('csv-parse');
require('dotenv').config();
const uploadRoutes = require("./routes/upload");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/sand-samples';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const sandSamplesRouter = require('./routes/sandSamples');

// Use routes
app.use('/api/sand-samples', sandSamplesRouter);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Sand Sample Data API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.use("/api", uploadRoutes);


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});