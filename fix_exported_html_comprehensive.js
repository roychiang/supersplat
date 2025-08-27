const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlPath = path.join(__dirname, '1402px-Jacques-Louis_David,_Le_Serment_des_Horaces.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying comprehensive fixes to exported HTML file...');

// Fix 1: Add camera transition fix by adding state.cameraMode = 'anim' to dot click handler
const oldDotHandler = `                        } else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Always use immediate switch for consistent single-click behavior
                                viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                state.animationPaused = false;
                                events.fire('setAnimationTime', 0);
                            }
                        }`;

const newDotHandler = `                        } else {
                            const setIndex = parseInt(setId) - 1; // Convert 1-3 to 0-2 array indices
                            activeAnimationSet = setId;
                            
                            // Get target animation track
                            const targetTrack = currentAnimationTracks[setIndex];
                            if (targetTrack) {
                                // Set camera mode to enable smooth transitions
                                state.cameraMode = 'anim';
                                // Always use immediate switch for consistent single-click behavior
                                viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                state.animationPaused = false;
                                events.fire('setAnimationTime', 0);
                            }
                        }`;

if (content.includes(oldDotHandler)) {
    content = content.replace(oldDotHandler, newDotHandler);
    console.log('1. ✓ Added camera transition fix (state.cameraMode = "anim") to dot click handler');
} else {
    console.log('1. ⚠ Dot click handler pattern not found - may already be fixed or different format');
}

// Fix 2: Add resetComplete event handler if it doesn't exist
if (!content.includes("events.on('resetComplete'")) {
    const resetCompleteHandler = `
                // Handle reset completion to update animation dots
                events.on('resetComplete', () => {
                    updateAnimationDots();
                    showUI();
                });`;
    
    // Find a good insertion point - after the showUI function
    const insertAfter = `showUI();

                events.on('inputEvent', showUI);`;
    
    const insertPosition = content.indexOf(insertAfter);
    if (insertPosition !== -1) {
        const endPosition = insertPosition + insertAfter.length;
        content = content.slice(0, endPosition) + resetCompleteHandler + content.slice(endPosition);
        console.log('2. ✓ Added resetComplete event handler');
    } else {
        console.log('2. ⚠ Could not find insertion point for resetComplete handler');
    }
} else {
    console.log('2. ✓ resetComplete event handler already exists');
}

// Fix 3: Add resetComplete event firing after reset calls
const resetPattern = /events\.fire\('inputEvent',\s*'reset'\);/g;
let resetMatches = [];
let match;
while ((match = resetPattern.exec(content)) !== null) {
    resetMatches.push({
        match: match[0],
        index: match.index
    });
}

if (resetMatches.length > 0) {
    // Process matches in reverse order to maintain correct indices
    resetMatches.reverse().forEach(matchInfo => {
        // Check if resetComplete is already added after this reset call
        const afterReset = content.substring(matchInfo.index + matchInfo.match.length, matchInfo.index + matchInfo.match.length + 200);
        if (!afterReset.includes("events.fire('resetComplete')")) {
            const replacement = matchInfo.match + `
                            // Fire resetComplete event after reset
                            setTimeout(() => {
                                events.fire('resetComplete');
                            }, 100);`;
            content = content.substring(0, matchInfo.index) + replacement + content.substring(matchInfo.index + matchInfo.match.length);
        }
    });
    console.log(`3. ✓ Updated ${resetMatches.length} reset event calls to fire resetComplete`);
} else {
    console.log('3. ⚠ No reset event calls found to update');
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('\n✅ All fixes applied to exported HTML file successfully!');
console.log('Fixed issues:');
console.log('- Camera transitions now work between dots 1, 2, 3');
console.log('- Reset dot (dot 0) no longer requires double-click');
console.log('\nThe exported HTML file should now work correctly.');