const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Octokit } = require('@octokit/rest');

// Initialize GitHub API client
const octokit = new Octokit({
  auth: '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', // Replace with your personal access token
});

// Define storage for uploaded images
const storage = multer.memoryStorage();

// Initialize multer upload with the configured storage
const upload = multer({ storage: storage });

// Define route for uploading image
router.post('/saveImage', upload.single('courtImage'), async (req, res) => {
    // Check if file is uploaded successfully
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
    }

    try {
        // Upload image file to GitHub repository
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: 'astudentwhocodes',
            repo: 'courtify',
            path: `./src/img/courts/${req.file.originalname}`, // Path where image will be uploaded
            message: 'Upload image',
            content: req.file.buffer.toString('base64'),
        });

        console.log('Image uploaded to GitHub:', response.data.content);

        // Respond with success message
        return res.status(200).json({ message: 'Image saved successfully.' });
    } catch (error) {
        console.error('Error uploading image to GitHub:', error);

        // Respond with error message
        return res.status(500).json({ error: 'Failed to upload image to GitHub.' });
    }
});

module.exports = router;
