// Test script to verify export functionality with camera transition fixes
const fs = require('fs');
const path = require('path');

// Import the serializeViewer function
const { serializeViewer } = require('./dist/index.js');

console.log('Testing export functionality with camera transition fixes...');

// Check if serializeViewer is available
if (typeof serializeViewer === 'function') {
    console.log('✓ serializeViewer function found in built distribution');
    
    // Test the function (this would normally require actual viewer data)
    console.log('✓ Export functionality is available for testing');
    console.log('\nTo test camera transition fixes:');
    console.log('1. Load a .ply or .splat file in the SuperSplat application');
    console.log('2. Add multiple camera positions (dots 0, 1, 2, 3)');
    console.log('3. Export as HTML file');
    console.log('4. Open the exported HTML and test transitions between dots 1-3');
    console.log('\nThe fixes should ensure:');
    console.log('- No state.cameraMode = "anim" for non-reset dots (1-3)');
    console.log('- Reset dot (0) fires inputEvent reset for proper UI updates');
    console.log('- Smooth camera transitions between all dots');
} else {
    console.log('✗ serializeViewer function not found in built distribution');
    console.log('This may indicate a bundling issue or the function is not exported properly.');
}

console.log('\nTest completed.');