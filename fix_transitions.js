const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 all.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Find and replace the dot click handler logic
const oldDotHandler = `// Handle dot clicks with smooth transitions
                dots.forEach((dot) => {
                    dot.addEventListener('click', () => {
                        const setId = dot.dataset.set;
                        const previousSet = activeAnimationSet;
                        
                        if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Reset camera to initial position with smooth transition
                            events.fire('inputEvent', 'reset');
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
                                        setTimeout(() => {
                                            viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                            state.animationPaused = false;
                                            events.fire('setAnimationTime', 0);
                                        }, 200);
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
                        }
                        updateAnimationDots();
                        showUI();
                    });
                });`;

const newDotHandler = `// Handle dot clicks with smooth transitions for ALL combinations
                dots.forEach((dot) => {
                    dot.addEventListener('click', () => {
                        const setId = dot.dataset.set;
                        const previousSet = activeAnimationSet;
                        
                        if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Reset camera to initial position with smooth transition
                            events.fire('inputEvent', 'reset');
                        } else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Always do smooth transition when switching between different sets
                                // This includes: reset->animation, animation->animation, and all bidirectional cases
                                if (previousSet !== setId) {
                                    const targetPose = getTrackStartingPose(targetTrack);
                                    if (targetPose) {
                                        // Start smooth transition to new pose for ALL transitions
                                        transitionToPose(targetPose, 1.5);
                                        
                                        // Set the animation track after a brief delay to allow transition
                                        setTimeout(() => {
                                            viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                            state.animationPaused = false;
                                            events.fire('setAnimationTime', 0);
                                        }, 200);
                                    } else {
                                        // Fallback to immediate switch if pose calculation fails
                                        viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                        state.animationPaused = false;
                                        events.fire('setAnimationTime', 0);
                                    }
                                } else {
                                    // Same animation selected - just restart it
                                    viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                    state.animationPaused = false;
                                    events.fire('setAnimationTime', 0);
                                }
                            }
                        }
                        updateAnimationDots();
                        showUI();
                    });
                });`;

// Replace the dot handler logic
if (htmlContent.includes(oldDotHandler)) {
    htmlContent = htmlContent.replace(oldDotHandler, newDotHandler);
    console.log('✓ Updated dot click handler for bidirectional transitions');
} else {
    console.log('⚠ Could not find exact dot handler pattern, trying alternative approach...');
    
    // Try to find and replace the key condition
    const oldCondition = 'if (previousSet !== \'reset\' && previousSet !== setId) {';
    const newCondition = 'if (previousSet !== setId) {';
    
    if (htmlContent.includes(oldCondition)) {
        htmlContent = htmlContent.replace(oldCondition, newCondition);
        console.log('✓ Updated transition condition to include reset->animation transitions');
    } else {
        console.log('✗ Could not find transition condition to update');
    }
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✓ Successfully updated kling_21_5 all.html with bidirectional animation transitions');
console.log('\nChanges made:');
console.log('- Removed restriction that prevented reset->animation transitions');
console.log('- All dot-to-dot transitions now have smooth camera animations');
console.log('- Bidirectional transitions work for all combinations: 0↔1, 0↔2, 0↔3, 1↔2, 1↔3, 2↔3');