const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const ejs = require('ejs');
const summariesDirectory = path.join(__dirname, 'summaries');

const app = express();

// Configure multer storage and upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('home', { summary: null }); // Render home.ejs with initial summary as null
});

app.post('/upload', upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'keywordsFile', maxCount: 1 },
]), (req, res) => {
  if (!req.files || !req.files.pdfFile || !req.files.keywordsFile) {
    return res.status(400).send('No PDF or keywords file uploaded');
  }

  const pdfFile = req.files.pdfFile[0];
  const keywordsFile = req.files.keywordsFile[0];
  const numWords = req.body.numWords;
  console.log('Uploaded files:', pdfFile.filename, keywordsFile.filename);
  console.log('Number of words:', numWords);

  // Full path to the PDF file
  const pdfPath = path.join(__dirname, 'uploads', pdfFile.filename);

  // Execute mlmodel2.py
  const pythonProcess = spawn('python', ['mlmodel2.py', pdfPath, keywordsFile.path, numWords]);
  let summary = ''; // Variable to store summary
 

  // Listen for data from Python stdout
  pythonProcess.stdout.on('data', (data) => {
    summary += data.toString(); // Concatenate data to summary
  });

  // Listen for Python process to close
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    // Send the summary as JSON response
    res.json({ summary }); 
  });

  // Handle errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
    res.status(500).send('Error processing the document');
  });
}); 

app.get('/uploading', (req, res) => {
  res.render('uploading'); // Render the uploading.ejs file
});

app.get('/previous', (req, res) => {

  const fs = require('fs');

  fs.readdir(summariesDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      res.status(500).send('Error reading directory');
      return;
    }

    // Extract only the file names without extensions
    const summaries = files.map(file => path.parse(file).name);

    res.render('previous', { summaries: summaries }); // Ensure that summaries is passed as an object property
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(summariesDirectory);
});
