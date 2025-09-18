const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const SandSample = require("../models/SandSample"); // your Mongoose model

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

// Setup multer to save file temporarily
const upload = multer({ dest: "uploads/" });

router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        // Transform data according to new CSV structure
        const sample = {
          latitude: parseFloat(row.LAT),
          longitude: parseFloat(row.LON),
          numberOfGrains: parseInt(row.Number_of_Grains),
          d10: parseFloat(row.D10),
          d16: parseFloat(row.D16),
          d25: parseFloat(row.D25),
          d50: parseFloat(row.D50),
          d65: parseFloat(row.D65),
          d75: parseFloat(row.D75),
          d84: parseFloat(row.D84),
          d90: parseFloat(row.D90),
          dmean: parseFloat(row.Dmean),
          dmed: parseFloat(row.Dmed),
          sedimentType: categorizeSediment(parseFloat(row.Dmed))
        };
        
        // Basic validation
        if (!isNaN(sample.latitude) && !isNaN(sample.longitude) && 
            !isNaN(sample.numberOfGrains) && !isNaN(sample.d50)) {
          results.push(sample);
        }
      })
      .on("end", async () => {
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

        // Delete temp file
        fs.unlinkSync(req.file.path);
          
        res.status(200).json({ 
          message: "CSV uploaded successfully", 
          count: uniqueResults.length,
          duplicatesSkipped: results.length - uniqueResults.length
        });
        
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "CSV upload failed" });
  }
});

module.exports = router;
