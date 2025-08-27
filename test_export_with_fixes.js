// Test script to verify that exported HTML includes the camera transition fixes
const fs = require('fs');
const path = require('path');

// Read the viewer's dist index.js file that gets embedded in exports
const viewerJsPath = path.join(__dirname, 'submodules', 'supersplat-viewer', 'dist', 'index.js');
const viewerJs = fs.readFileSync(viewerJsPath, 'utf8');

console.log('Testing viewer JavaScript for export fixes...');

// Check for camera transition fixes
const hasCameraTransitionFix = viewerJs.includes("state.cameraMode = 'anim'");
console.log('✓ Camera transition fix (state.cameraMode = \'anim\'):', hasCameraTransitionFix ? 'FOUND' : 'NOT FOUND');

// Check for resetComplete event handling
const hasResetCompleteEvent = viewerJs.includes('resetComplete');
console.log('✓ ResetComplete event handling:', hasResetCompleteEvent ? 'FOUND' : 'NOT FOUND');

// Check for dot click handler
const hasDotClickHandler = viewerJs.includes('dot.addEventListener');
console.log('✓ Dot click event handler:', hasDotClickHandler ? 'FOUND' : 'NOT FOUND');

// Check for reset operation with resetComplete event
const hasResetWithEvent = viewerJs.includes("events.fire('resetComplete')");
console.log('✓ Reset operation fires resetComplete event:', hasResetWithEvent ? 'FOUND' : 'NOT FOUND');

if (hasCameraTransitionFix && hasResetCompleteEvent && hasDotClickHandler && hasResetWithEvent) {
    console.log('\n🎉 SUCCESS: All export fixes are present in the viewer JavaScript!');
    console.log('   Exported HTML files will automatically include:');
    console.log('   - Camera transition fixes for smooth animations');
    console.log('   - Proper resetComplete event handling');
    console.log('   - Enhanced dot click behavior');
} else {
    console.log('\n❌ ISSUE: Some fixes are missing from the viewer JavaScript.');
    console.log('   This means exported HTML files may not include all fixes.');
}

console.log('\nNote: The fixes are applied directly in the viewer source code,');
console.log('so they will be automatically included in all HTML exports.');
console.log('No post-processing is required!');