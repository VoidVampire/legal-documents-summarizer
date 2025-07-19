const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();

const summariesDirectory = path.join(__dirname, 'summaries');
const uploadsDirectory = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(summariesDirectory)) fs.mkdirSync(summariesDirectory);
if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

// Configure multer storage
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

// --- Main Routes ---

// Home Page
app.get('/', (req, res) => {
  res.render('home');
});

// Upload Page
app.get('/uploading', (req, res) => {
  res.render('uploading');
});

// New, Interactive Past Summaries Page
app.get('/past-summaries', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'past_summaries.html'));
});

// API endpoint to get summaries data for the new page
app.get('/api/summaries', async (req, res) => {
    try {
        const files = await fs.promises.readdir(summariesDirectory);

        // Create an array of promises, where each promise reads a file
        const readPromises = files.map(async (file, index) => {
            const filePath = path.join(summariesDirectory, file);
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Create the data object for each summary
            return {
                id: index,
                title: path.parse(file).name.replace(/_/g, ' ').replace(/\s\d+$/, ''), // Clean up title
                date: new Date().toISOString().split('T')[0], // Placeholder date, real one would be stored
                topic: 'General Law', // Placeholder topic
                content: content // The ACTUAL file content
            };
        });

        // Wait for all files to be read
        const summariesData = await Promise.all(readPromises);
        
        // Send the complete data as JSON
        res.json(summariesData);

    } catch (err) {
        console.error('Error reading summaries directory:', err);
        return res.status(500).json({ error: 'Error reading summaries' });
    }
});

// File Upload and Processing Route
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

  const pdfPath = path.join(__dirname, 'uploads', pdfFile.filename);

  // Execute mlmodel2.py
  const pythonProcess = spawn('python', ['mlmodel2.py', pdfPath, keywordsFile.path, numWords]);
  let summary = '';

  pythonProcess.stdout.on('data', (data) => {
    summary += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    if (code === 0) {
      // Send the summary as JSON response on success
      res.json({ summary });
    } else {
      res.status(500).json({ error: 'Error processing the document' });
    }
  });
});

// --- Deprecated Route (for the old previous.ejs page) ---
app.get('/previous', (req, res) => {
  fs.readdir(summariesDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }
    const summaries = files.map(file => path.parse(file).name);
    res.render('previous', { summaries: summaries });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});