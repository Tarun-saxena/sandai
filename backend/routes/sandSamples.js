const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const SandSample = require('../models/SandSample');

const router = express.Router();

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload and process CSV file
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (data) => {
      // Validate and transform data
      const sample = {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        diameter: parseFloat(data.diameter),
        description: data.description
      };

      // Basic validation
      if (isNaN(sample.latitude) || isNaN(sample.longitude) || isNaN(sample.diameter)) {
        return;
      }

      results.push(sample);
    })
    .on('end', async () => {
      try {
        // Insert all valid records into MongoDB
        await SandSample.insertMany(results);
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ 
          message: 'CSV file processed successfully', 
          samplesProcessed: results.length 
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Error saving data to database',
          details: error.message 
        });
      }
    })
    .on('error', (error) => {
      res.status(500).json({ 
        error: 'Error processing CSV file',
        details: error.message 
      });
    });
});

// Get total number of samples
router.get('/count', async (req, res) => {
  try {
    const count = await SandSample.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching count' });
  }
});

// Get all sand samples
router.get('/', async (req, res) => {
  try {
    const samples = await SandSample.find({});
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching samples' });
  }
});

// Get sand samples within a geographic boundary
router.get('/bounds', async (req, res) => {
  const { north, south, east, west } = req.query;
  
  try {
    const samples = await SandSample.find({
      latitude: { $gte: south, $lte: north },
      longitude: { $gte: west, $lte: east }
    });
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching samples within bounds' });
  }
});

// Get diameter statistics
router.get('/stats/diameter', async (req, res) => {
  try {
    const stats = await SandSample.aggregate([
      {
        $group: {
          _id: null,
          avgDiameter: { $avg: '$diameter' },
          minDiameter: { $min: '$diameter' },
          maxDiameter: { $max: '$diameter' },
          totalSamples: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || { error: 'No data available' });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating diameter statistics' });
  }
});

// Get samples grouped by diameter ranges
router.get('/stats/diameter-distribution', async (req, res) => {
  try {
    const distribution = await SandSample.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$diameter', 0.1] }, then: '< 0.1mm' },
                { case: { $lt: ['$diameter', 0.25] }, then: '0.1-0.25mm' },
                { case: { $lt: ['$diameter', 0.5] }, then: '0.25-0.5mm' },
                { case: { $lt: ['$diameter', 1] }, then: '0.5-1mm' },
                { case: { $lt: ['$diameter', 2] }, then: '1-2mm' }
              ],
              default: '> 2mm'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: 'Error calculating diameter distribution' });
  }
});

module.exports = router;