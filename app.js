const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();


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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/past-summaries', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'past_summaries.html'));
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
  res.send('Files uploaded successfully');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
