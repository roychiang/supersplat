const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlPath = path.join(__dirname, '1402px-Jacques-Louis_David,_Le_Serment_des_Horaces.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying final comprehensive fixes to exported HTML file...');

// Fix 1: Add resetComplete event handler if missing
if (!content.includes("events.on('resetComplete'")) {
    console.log('Adding resetComplete event handler...');
    
    // Find insertion point after showUI function
    const showUIPattern = /showUI\(\);\s*events\.on\('inputEvent',\s*showUI\);/;
    const match = content.match(showUIPattern);
    
    if (match) {
        const insertAfter = match[0];
        const resetCompleteHandler = `

                // Handle reset completion to update animation dots
                events.on('resetComplete', () => {
                    updateAnimationDots();
                    showUI();
                });`;
        
        content = content.replace(insertAfter, insertAfter + resetCompleteHandler);
        console.log('✓ Added resetComplete event handler');
    } else {
        console.log('⚠ Could not find insertion point for resetComplete handler');
    }
} else {
    console.log('✓ resetComplete event handler already exists');
}

// Fix 2: Add camera transition fix - more flexible pattern matching
console.log('Adding camera transition fix...');

// Look for the viewer.setAnimationTracks call in the non-reset dot handler
const setAnimationTracksPattern = /(\s+)(\/\/ Always use immediate switch for consistent single-click behavior\s+viewer\.setAnimationTracks\(currentAnimationTracks, setIndex\);)/;
const tracksMatch = content.match(setAnimationTracksPattern);

if (tracksMatch) {
    const indentation = tracksMatch[1];
    const originalCode = tracksMatch[2];
    const newCode = `${indentation}// Set camera mode to enable smooth transitions
${indentation}state.cameraMode = 'anim';
${indentation}${originalCode.trim()}`;
    
    content = content.replace(tracksMatch[0], newCode);
    console.log('✓ Added camera transition fix (state.cameraMode = "anim")');
} else {
    console.log('⚠ Could not find setAnimationTracks pattern to add camera transition fix');
    
    // Try alternative pattern - look for the targetTrack check
    const targetTrackPattern = /(\s+)(if \(targetTrack\) \{\s+\/\/ Always use immediate switch)/;
    const targetMatch = content.match(targetTrackPattern);
    
    if (targetMatch) {
        const indentation = targetMatch[1];
        const originalCode = targetMatch[2];
        const newCode = `${indentation}${originalCode}
${indentation}    // Set camera mode to enable smooth transitions
${indentation}    state.cameraMode = 'anim';`;
        
        content = content.replace(targetMatch[0], newCode);
        console.log('✓ Added camera transition fix (alternative pattern)');
    } else {
        console.log('⚠ Could not find any suitable pattern for camera transition fix');
    }
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('\n✅ Final comprehensive fixes applied!');
console.log('Fixed issues:');
console.log('- Camera transitions should now work between dots 1, 2, 3');
console.log('- Reset dot (dot 0) should no longer require double-click');
console.log('\nThe exported HTML file should now work correctly.');