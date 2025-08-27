const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 1.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Fix 1: Remove the 4-second timeout logic that hides UI elements
const oldTimeoutLogic = `                // show the ui and start a timer to hide it again
                let uiTimeout = null;
                const showUI = () => {
                    if (uiTimeout) {
                        clearTimeout(uiTimeout);
                    }
                    state.uiVisible = true;
                    uiTimeout = setTimeout(() => {
                        uiTimeout = null;
                        state.uiVisible = false;
                    }, 4000);
                };
                showUI();
            
                events.on('inputEvent', showUI);`;

const newTimeoutLogic = `                // Keep UI always visible for 'Animation Set All' mode
                let uiTimeout = null;
                const showUI = () => {
                    // Always keep UI visible when animSetType is 'all'
                    state.uiVisible = true;
                    // No timeout - UI stays visible permanently
                };
                showUI();
            
                // Don't hide UI on input events for 'Animation Set All' mode
                // events.on('inputEvent', showUI);`;

// Fix 2: Update updateAnimationDots function to always show dots when animSetType is 'all'
const oldUpdateAnimationDots = `                const updateAnimationDots = () => {
                    if (currentAnimationTracks.length >= 3) {
                        animationDots.classList.remove('hidden');
                        // Update active dot
                        dots.forEach((dot) => {
                            dot.classList.remove('active');
                            if (dot.dataset.set === activeAnimationSet) {
                                dot.classList.add('active');
                            }
                        });
                    } else {
                        animationDots.classList.add('hidden');
                    }
                };`;

const newUpdateAnimationDots = `                const updateAnimationDots = () => {
                    // Always show animation dots when animSetType is 'all'
                    animationDots.classList.remove('hidden');
                    // Update active dot
                    dots.forEach((dot) => {
                        dot.classList.remove('active');
                        if (dot.dataset.set === activeAnimationSet) {
                            dot.classList.add('active');
                        }
                    });
                };`;

// Fix 3: Fix inconsistent dot click behavior for single-click transitions
const oldDotClickLogic = `                        } else {
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
                        }`;

const newDotClickLogic = `                        } else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Always do smooth transition for consistent single-click behavior
                                const targetPose = getTrackStartingPose(targetTrack);
                                if (targetPose && previousSet !== setId) {
                                    // Start smooth transition to new pose
                                    transitionToPose(targetPose, 1.5);
                                    
                                    // Set the animation track after a brief delay to allow transition
                                    setTimeout(() => {
                                        viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                        state.animationPaused = false;
                                        events.fire('setAnimationTime', 0);
                                    }, 200);
                                } else {
                                    // Direct switch for same animation or when no pose available
                                    viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                    state.animationPaused = false;
                                    events.fire('setAnimationTime', 0);
                                }
                            }
                        }`;

// Apply all fixes
htmlContent = htmlContent.replace(oldTimeoutLogic, newTimeoutLogic);
htmlContent = htmlContent.replace(oldUpdateAnimationDots, newUpdateAnimationDots);
htmlContent = htmlContent.replace(oldDotClickLogic, newDotClickLogic);

// Write the fixed HTML file
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

console.log('Successfully fixed kling_21_5 1.html:');
console.log('1. Removed 4-second timeout - UI elements now stay visible permanently');
console.log('2. Fixed updateAnimationDots to always show dots in Animation Set All mode');
console.log('3. Fixed inconsistent dot click behavior - all transitions now use single click');