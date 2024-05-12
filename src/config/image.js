const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Firebase Storage
const storage = new Storage({
    projectId: 'courtify-ed05a',
    keyFilename: 'service_account_key.json', // Path to your service account key file
});

// Initialize Multer for file uploads
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Define route for uploading image
router.post('/saveImage', upload.single('courtImage'), async (req, res) => {
    try {
        // Check if file is uploaded successfully
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        // Upload file to Firebase Storage in the '/courts/' folder
        const bucketName = 'courtify-ed05a.appspot.com';
        const bucket = storage.bucket(bucketName);
        const filename = `courts/court${Date.now()}${path.extname(req.file.originalname)}`; // Specify the folder path in the filename
        const file = bucket.file(filename);
        const fileBuffer = req.file.buffer;

        await file.save(fileBuffer, {
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        console.log('Image uploaded:', filename);

        // Return only the filename
        const onlyFilename = path.basename(filename);
        return res.status(200).json({ message: 'Image saved successfully.', filename: onlyFilename });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ error: 'Failed to upload image.' });
    }
});

module.exports = router;
