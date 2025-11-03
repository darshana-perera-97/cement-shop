const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Path to frontend build folder
const buildPath = path.join(__dirname, '..', 'frontend', 'build');

// Check if build folder exists
if (!fs.existsSync(buildPath)) {
    console.error(`Error: Build folder not found at ${buildPath}`);
    console.error('Please build the frontend first: cd frontend && npm run build');
    process.exit(1);
}

// Serve static files from the React app build folder
app.use(express.static(buildPath));

// Handle React routing - catch all routes that don't match static files
app.use((req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

// Use your preferred port
const PORT = process.env.PORT || 2029;
app.listen(PORT, () => {
    console.log(`Frontend server is running on port ${PORT}`);
    console.log(`Serving files from: ${buildPath}`);
});
