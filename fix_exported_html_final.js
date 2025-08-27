const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 all.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying fixes to exported HTML file...');

// Fix 1: Update showUI function to prevent auto-hide when animSetType is 'all'
const oldShowUI = `const showUI = () => {
                    if (uiTimeout) {
                        clearTimeout(uiTimeout);
                    }
                    state.uiVisible = true;
                    uiTimeout = setTimeout(() => {
                        uiTimeout = null;
                        state.uiVisible = false;
                    }, 4000);
                };`;

const newShowUI = `const showUI = () => {
                    if (uiTimeout) {
                        clearTimeout(uiTimeout);
                    }
                    state.uiVisible = true;
                    // Don't auto-hide UI when animSetType is 'all'
                    if (settings.animSetType !== 'all') {
                        uiTimeout = setTimeout(() => {
                            uiTimeout = null;
                            state.uiVisible = false;
                        }, 4000);
                    }
                };`;

if (content.includes(oldShowUI)) {
    content = content.replace(oldShowUI, newShowUI);
    console.log('1. ✓ Fixed showUI function to prevent auto-hide for Animation Set All');
} else {
    console.log('1. ⚠ showUI function pattern not found - may already be fixed');
}

// Fix 2: Update updateAnimationDots function to always show dots when animSetType is 'all'
const oldUpdateAnimationDots = `const updateAnimationDots = () => {
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

const newUpdateAnimationDots = `const updateAnimationDots = () => {
                    // Always show dots when animSetType is 'all', otherwise require 3+ tracks
                    if (settings.animSetType === 'all' || currentAnimationTracks.length >= 3) {
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

if (content.includes(oldUpdateAnimationDots)) {
    content = content.replace(oldUpdateAnimationDots, newUpdateAnimationDots);
    console.log('2. ✓ Fixed updateAnimationDots function to always show dots for Animation Set All');
} else {
    console.log('2. ⚠ updateAnimationDots function pattern not found - may already be fixed');
}

// Fix 3: Remove duplicate resetComplete events that were added by previous script
content = content.replace(/\s*\/\/ Fire resetComplete event after reset\s*setTimeout\(\(\) => \{\s*events\.fire\('resetComplete'\);\s*\}, 100\);/g, '');
console.log('3. ✓ Removed duplicate resetComplete events');

// Fix 4: Add resetComplete event handler if it doesn't exist
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
        console.log('4. ✓ Added resetComplete event handler');
    } else {
        console.log('4. ⚠ Could not find insertion point for resetComplete handler');
    }
} else {
    console.log('4. ✓ resetComplete event handler already exists');
}

// Fix 5: Add single resetComplete event after reset calls
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
        const replacement = matchInfo.match + `
                            // Fire resetComplete event after reset
                            setTimeout(() => {
                                events.fire('resetComplete');
                            }, 100);`;
        content = content.substring(0, matchInfo.index) + replacement + content.substring(matchInfo.index + matchInfo.match.length);
    });
    console.log(`5. ✓ Updated ${resetMatches.length} reset event calls to fire resetComplete`);
} else {
    console.log('5. ⚠ No reset event calls found to update');
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('\n✅ All fixes applied to exported HTML file successfully!');
console.log('The reset dot issue should now be resolved in kling_21_5 all.html');