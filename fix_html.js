const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 all.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Fix 1: Update updateAnimationDots function to always show dots when animSetType is 'all'
const oldUpdateFunction = `                // Function to update animation dots visibility and state
                const updateAnimationDots = () => {
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

const newUpdateFunction = `                // Function to update animation dots visibility and state
                const updateAnimationDots = () => {
                    // Always show animation dots when animSetType is 'all'
                    if (animSetType === 'all') {
                        animationDots.classList.remove('hidden');
                        // Update active dot
                        dots.forEach((dot) => {
                            dot.classList.remove('active');
                            if (dot.dataset.set === activeAnimationSet) {
                                dot.classList.add('active');
                            }
                        });
                    } else if (currentAnimationTracks.length >= 3) {
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

// Fix 2: Ensure fullscreen buttons are visible
const oldFullscreenComment = `                    // Keep fullscreen buttons visible and functional
                    // dom.enterFullscreen.style.display = 'none';
                    // dom.exitFullscreen.style.display = 'none';`;

const newFullscreenComment = `                    // Keep fullscreen buttons visible and functional
                    dom.enterFullscreen.style.display = '';
                    dom.exitFullscreen.style.display = '';`;

// Apply fixes
htmlContent = htmlContent.replace(oldUpdateFunction, newUpdateFunction);
htmlContent = htmlContent.replace(oldFullscreenComment, newFullscreenComment);

// Write the fixed HTML file
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

console.log('HTML file has been fixed:');
console.log('1. Animation dots will always be visible when animSetType is "all"');
console.log('2. Fullscreen buttons will remain visible and functional');
console.log('3. Ready to fix animation transitions next');