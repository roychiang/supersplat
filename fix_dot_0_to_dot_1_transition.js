const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlFilePath = path.join(__dirname, 'kling_21_5 1.html');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

console.log('Reading HTML file...');

// Find the dot click handler section
const dotClickHandlerStart = htmlContent.indexOf('// Handle dot clicks with consistent single-click behavior');
if (dotClickHandlerStart === -1) {
    console.error('Could not find dot click handler section');
    process.exit(1);
}

// Find the specific section where non-reset dots are handled
const nonResetDotHandlerStart = htmlContent.indexOf('} else {', dotClickHandlerStart);
const nonResetDotHandlerEnd = htmlContent.indexOf('updateAnimationDots();', nonResetDotHandlerStart);

if (nonResetDotHandlerStart === -1 || nonResetDotHandlerEnd === -1) {
    console.error('Could not find non-reset dot handler section');
    process.exit(1);
}

// Extract the current non-reset dot handler
const currentHandler = htmlContent.substring(nonResetDotHandlerStart, nonResetDotHandlerEnd);
console.log('Found current non-reset dot handler:', currentHandler.substring(0, 200) + '...');

// Create the new handler with smooth transition logic
const newHandler = `} else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Check if we're transitioning from orbit mode (dot 0) to anim mode
                                const wasInOrbitMode = state.cameraMode === 'orbit';
                                
                                // Set animation tracks and switch to animation mode for smooth camera transitions
                                viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                
                                if (wasInOrbitMode) {
                                    // For transitions from orbit to anim mode, trigger smooth transition
                                    // by temporarily switching modes to reset the transition timer
                                    state.cameraMode = 'fly'; // Temporary mode switch
                                    setTimeout(() => {
                                        state.cameraMode = 'anim'; // Switch to anim mode with transition
                                        state.animationPaused = false;
                                        events.fire('setAnimationTime', 0);
                                    }, 10);
                                } else {
                                    // For transitions already in anim mode, use existing logic
                                    state.cameraMode = 'anim';
                                    state.cameraMode = 'anim'; // This triggers smooth camera transition
                                    state.animationPaused = false;
                                    events.fire('setAnimationTime', 0);
                                }
                            }
                        `;

// Replace the handler
const updatedContent = htmlContent.substring(0, nonResetDotHandlerStart) + 
                      newHandler + 
                      htmlContent.substring(nonResetDotHandlerEnd);

// Write the updated content back to the file
fs.writeFileSync(htmlFilePath, updatedContent, 'utf8');

console.log('Successfully applied dot 0 to dot 1 transition fix!');
console.log('The fix ensures smooth camera transitions when clicking from dot 0 (reset/orbit mode) to any animation dot (1, 2, 3).');
console.log('\nChanges made:');
console.log('- Added detection for transitions from orbit mode to anim mode');
console.log('- Added temporary mode switch to trigger transition timer reset');
console.log('- Maintained existing logic for anim-to-anim transitions');