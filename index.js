const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const convertBsonToJson = require("./convertBson");

const app = express();
const port = 3000;

// Path to save JSON files
const JSON_DIR = path.join(__dirname, "jsonFiles");
if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR);

// Setup multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static("public"));

// Upload endpoint (converts BSON to JSON and saves it)
app.post("/upload", upload.single("bsonFile"), (req, res) => {
  const bsonData = req.file.buffer;
  const originalName = req.file.originalname.replace(/\.bson$/i, "");
  const jsonFileName = `${originalName}.json`;
  const outputPath = path.join(JSON_DIR, jsonFileName);

  // Delete previous files in jsonFiles directory
  fs.readdirSync(JSON_DIR).forEach((f) =>
    fs.unlinkSync(path.join(JSON_DIR, f))
  );

  // Convert BSON to JSON and save it to the file
  convertBsonToJson(bsonData, outputPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Conversion failed" });
    }
    res.json({ filename: jsonFileName });
  });
});

// Download endpoint to serve the generated JSON file
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(JSON_DIR, req.params.filename);
  console.log("Download requested:", req.params.filename);
  console.log("Looking for file at:", filePath);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    console.error("❌ File not found at:", filePath);
    res.status(404).send("File not found");
  }
});

app.post("/clear-temp", (req, res) => {
  try {
    const files = fs.readdirSync(JSON_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(JSON_DIR, file));
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to clear jsonFiles folder:", err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
