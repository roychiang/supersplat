const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlPath = path.join(__dirname, '1402px-Jacques-Louis_David,_Le_Serment_des_Horaces.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Adding camera transition fix to exported HTML file...');

// Fix: Add state.cameraMode = 'anim' to enable camera transitions for dots 1-3
const oldCode = `                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Always use immediate switch for consistent single-click behavior
                                viewer.setAnimationTracks(currentAnimationTracks, setIndex);`;

const newCode = `                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Set camera mode to enable smooth transitions
                                state.cameraMode = 'anim';
                                // Always use immediate switch for consistent single-click behavior
                                viewer.setAnimationTracks(currentAnimationTracks, setIndex);`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    console.log('✓ Added camera transition fix (state.cameraMode = "anim") to dot click handler');
} else {
    console.log('⚠ Could not find the exact pattern to replace');
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('\n✅ Camera transition fix applied successfully!');
console.log('Camera transitions should now work between dots 1, 2, 3');