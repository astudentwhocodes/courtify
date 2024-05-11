const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'img/courts'); // Destination folder for saving images
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with the prefix 'court' and timestamp
        const filename = 'court' + Date.now() + path.extname(file.originalname); // Add file extension
        cb(null, filename);
    }
});

// Initialize multer upload with the configured storage
const upload = multer({ storage: storage });

// Define route for uploading image
router.post('/saveImage', upload.single('courtImage'), (req, res) => {
    // Check if file is uploaded successfully
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
    }

    // File uploaded successfully
    const imagePath = req.file.filename; // Use the filename provided by multer
    console.log('Image uploaded:', imagePath);

    // You can save imagePath to the database or perform other operations here

    return res.status(200).json({ message: 'Image saved successfully.', imagePath: imagePath });
});

module.exports = router;
