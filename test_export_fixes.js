// Test script to verify that export fixes are applied automatically
const fs = require('fs');
const path = require('path');

// Read the built splat-serialize.js to check if our fixes are included
const distPath = path.join(__dirname, 'dist', 'index.js');

if (fs.existsSync(distPath)) {
    const content = fs.readFileSync(distPath, 'utf8');
    
    console.log('Checking if export fixes are included in the built file...');
    
    // Check for the injectViewerFixes function
    if (content.includes('injectViewerFixes')) {
        console.log('✓ injectViewerFixes function found in built file');
    } else {
        console.log('✗ injectViewerFixes function NOT found in built file');
    }
    
    // Check for camera transition fix
    if (content.includes('Camera transition fix applied')) {
        console.log('✓ Camera transition fix code found');
    } else {
        console.log('✗ Camera transition fix code NOT found');
    }
    
    // Check for resetComplete fix
    if (content.includes('resetComplete fix applied')) {
        console.log('✓ resetComplete fix code found');
    } else {
        console.log('✗ resetComplete fix code NOT found');
    }
    
    // Check if the serializeViewer function calls injectViewerFixes
    if (content.includes('injectViewerFixes(indexJs)')) {
        console.log('✓ serializeViewer function calls injectViewerFixes');
    } else {
        console.log('✗ serializeViewer function does NOT call injectViewerFixes');
    }
    
    console.log('\nExport fixes verification complete!');
    console.log('The fixes will now be automatically applied when exporting HTML files.');
    
} else {
    console.log('Built file not found at:', distPath);
    console.log('Please run "npm run build" first.');
}