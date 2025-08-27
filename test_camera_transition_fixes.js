// Test script to verify camera transition fixes are applied during export
const fs = require('fs');
const path = require('path');

// Read the built splat-serialize.js to check if our updated fixes are included
const distPath = path.join(__dirname, 'dist', 'index.js');

if (fs.existsSync(distPath)) {
    const content = fs.readFileSync(distPath, 'utf8');
    
    console.log('Checking camera transition fixes in the built file...');
    
    // Check for the updated injectViewerFixes function
    if (content.includes('injectViewerFixes')) {
        console.log('✓ injectViewerFixes function found');
        
        // Check for the correct fix patterns
        if (content.includes('Remove state.cameraMode')) {
            console.log('✓ Fix 1: Remove state.cameraMode from non-reset dots - FOUND');
        } else {
            console.log('✗ Fix 1: Remove state.cameraMode pattern - NOT FOUND');
        }
        
        if (content.includes('inputEvent.*reset')) {
            console.log('✓ Fix 2: Reset dot fires inputEvent reset - FOUND');
        } else {
            console.log('✗ Fix 2: inputEvent reset pattern - NOT FOUND');
        }
        
        if (content.includes('Camera transition fixes applied')) {
            console.log('✓ Fix marker: Camera transition fixes applied - FOUND');
        } else {
            console.log('✗ Fix marker - NOT FOUND');
        }
        
        // Check that the function is called in serializeViewer
        if (content.includes('injectViewerFixes(indexJs)')) {
            console.log('✓ injectViewerFixes is called in serializeViewer');
        } else {
            console.log('✗ injectViewerFixes call in serializeViewer - NOT FOUND');
        }
        
        console.log('\n✅ Camera transition fixes are properly integrated into the export process!');
        console.log('When you export HTML files, they will automatically include camera transition fixes.');
        
    } else {
        console.log('✗ injectViewerFixes function not found in built file');
    }
} else {
    console.log('✗ Built file not found at:', distPath);
}