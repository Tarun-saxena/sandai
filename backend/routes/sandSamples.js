const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const SandSample = require('../models/SandSample');

const router = express.Router();

// Helper function to categorize sediment based on Dmed
const categorizeSediment = (dmed) => {
  if (dmed < 0.063) {
    return "Silt/Clay";
  } else if (dmed < 0.2) {
    return "Fine Sand";
  } else if (dmed < 0.63) {
    return "Medium Sand";
  } else if (dmed < 2.0) {
    return "Very Coarse Sand";
  } else {
    return "Gravel";
  }
};

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
      // Validate and transform data according to new CSV structure
      const sample = {
        latitude: parseFloat(data.LAT),
        longitude: parseFloat(data.LON),
        numberOfGrains: parseInt(data.Number_of_Grains),
        d10: parseFloat(data.D10),
        d16: parseFloat(data.D16),
        d25: parseFloat(data.D25),
        d50: parseFloat(data.D50),
        d65: parseFloat(data.D65),
        d75: parseFloat(data.D75),
        d84: parseFloat(data.D84),
        d90: parseFloat(data.D90),
        dmean: parseFloat(data.Dmean),
        dmed: parseFloat(data.Dmed),
        sedimentType: categorizeSediment(parseFloat(data.Dmed))
      };

      // Basic validation for required fields
      if (isNaN(sample.latitude) || isNaN(sample.longitude) || 
          isNaN(sample.numberOfGrains) || isNaN(sample.d50) || 
          isNaN(sample.dmean) || isNaN(sample.dmed)) {
        return;
      }

      results.push(sample);
    })
    .on('end', async () => {
      try {
        // Filter out duplicates by checking existing records
        const uniqueResults = [];
        
        for (const sample of results) {
          const existing = await SandSample.findOne({
            latitude: sample.latitude,
            longitude: sample.longitude,
            d50: sample.d50
          });
          
          if (!existing) {
            uniqueResults.push(sample);
          }
        }
        
        // Insert only unique records into MongoDB
        if (uniqueResults.length > 0) {
          await SandSample.insertMany(uniqueResults);
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ 
          message: 'CSV file processed successfully', 
          samplesProcessed: uniqueResults.length,
          duplicatesSkipped: results.length - uniqueResults.length
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

// Get grain size statistics
router.get('/stats/grain-size', async (req, res) => {
  try {
    const stats = await SandSample.aggregate([
      {
        $group: {
          _id: null,
          avgD50: { $avg: '$d50' },
          minD50: { $min: '$d50' },
          maxD50: { $max: '$d50' },
          avgDmean: { $avg: '$dmean' },
          minDmean: { $min: '$dmean' },
          maxDmean: { $max: '$dmean' },
          avgNumberOfGrains: { $avg: '$numberOfGrains' },
          totalSamples: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || { error: 'No data available' });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating grain size statistics' });
  }
});

// Get samples grouped by sediment types
router.get('/stats/sediment-distribution', async (req, res) => {
  try {
    const distribution = await SandSample.aggregate([
      {
        $group: {
          _id: '$sedimentType',
          count: { $sum: 1 }
        }
      },
      { $sort: { 'count': -1 } }
    ]);
    
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: 'Error calculating sediment distribution' });
  }
});

// Get samples grouped by D50 ranges
router.get('/stats/d50-distribution', async (req, res) => {
  try {
    const distribution = await SandSample.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$d50', 0.1] }, then: '< 0.1mm' },
                { case: { $lt: ['$d50', 0.25] }, then: '0.1-0.25mm' },
                { case: { $lt: ['$d50', 0.5] }, then: '0.25-0.5mm' },
                { case: { $lt: ['$d50', 1] }, then: '0.5-1mm' },
                { case: { $lt: ['$d50', 2] }, then: '1-2mm' }
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
    res.status(500).json({ error: 'Error calculating D50 distribution' });
  }
});

module.exports = router;