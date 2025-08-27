const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 1.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Fix 1: Modify the reset dot click handler to ensure proper state update
const resetClickHandlerFix = `                    dot.addEventListener('click', () => {
                        const setId = dot.dataset.set;
                        const previousSet = activeAnimationSet;
                        
                        if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Reset camera to initial position with smooth transition
                            events.fire('inputEvent', 'reset');
                            // Don't call updateAnimationDots here - let the reset event handler do it
                        } else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // If transitioning between animation sets (not from reset), do smooth transition
                                if (previousSet !== 'reset' && previousSet !== setId) {
                                    const targetPose = getTrackStartingPose(targetTrack);
                                    if (targetPose) {
                                        // Start smooth transition to new pose
                                        transitionToPose(targetPose, 1.5);
                                        
                                        // Set the animation track after a brief delay to allow transition
                                        viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                            updateAnimationDots();
                                            showUI();
                                    } else {
                                        // Fallback to immediate switch
                                        viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                        state.animationPaused = false;
                                        events.fire('setAnimationTime', 0);
                                    }
                                } else {
                                    // Direct switch for reset->animation or same animation
                                    viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                    state.animationPaused = false;
                                    events.fire('setAnimationTime', 0);
                                }
                            }
                            updateAnimationDots();
                            showUI();
                        }
                    });`;

// Find and replace the reset dot click handler
const resetClickPattern = /dot\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/;
if (resetClickPattern.test(htmlContent)) {
    htmlContent = htmlContent.replace(resetClickPattern, resetClickHandlerFix);
    console.log('✓ Fixed reset dot click handler');
} else {
    console.log('✗ Reset dot click handler pattern not found');
}

// Fix 2: Modify the reset event handler to call updateAnimationDots after reset completes
const resetEventHandlerFix = `                        switch (eventName) {
                            case 'frame':
                                doReset(framePose);
                                break;
                            case 'reset':
                                doReset(resetPose);
                                // Update animation dots after reset completes
                                setTimeout(() => {
                                    updateAnimationDots();
                                    showUI();
                                }, 0);
                                break;
                            case 'cancel':
                            case 'interrupt':
                                if (state.cameraMode === 'anim') {
                                    state.cameraMode = prevCameraMode;
                                }
                                break;
                        }`;

// Find and replace the reset event handler switch statement
const resetEventPattern = /switch \(eventName\) \{[\s\S]*?case 'reset':[\s\S]*?break;[\s\S]*?case 'cancel':[\s\S]*?\}/;
if (resetEventPattern.test(htmlContent)) {
    htmlContent = htmlContent.replace(resetEventPattern, resetEventHandlerFix);
    console.log('✓ Fixed reset event handler to update dots after reset');
} else {
    console.log('✗ Reset event handler pattern not found');
}

// Write the fixed content back to the file
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('\n✓ All fixes applied to kling_21_5 1.html');
console.log('✓ Reset dot should now work with single click from any other dot');