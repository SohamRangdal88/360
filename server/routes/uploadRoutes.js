const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

/* POST /api/uploads — upload one file */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  res.json({
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    fileSize: req.file.size
  });
});

/* DELETE /api/uploads/:filename — remove an uploaded file */
router.delete('/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted' });
});

module.exports = router;
