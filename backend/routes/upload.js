const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const SandSample = require("../models/SandSample"); // your Mongoose model

const router = express.Router();

// Setup multer to save file temporarily
const upload = multer({ dest: "uploads/" });

router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        // Example: insert into MongoDB
        await SandSample.insertMany(results);

        // Delete temp file
        fs.unlinkSync(req.file.path);

        res.json({ message: "CSV uploaded successfully", count: results.length });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "CSV upload failed" });
  }
});

module.exports = router;
