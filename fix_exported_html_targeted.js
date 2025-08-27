const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 all.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying targeted fixes to exported HTML file...');

// Fix 1: Update showUI function - find and replace the specific timeout logic
const showUIPattern = /uiTimeout = setTimeout\(\(\) => \{\s*uiTimeout = null;\s*state\.uiVisible = false;\s*\}, 4000\);/;
if (showUIPattern.test(content)) {
    content = content.replace(showUIPattern, `// Don't auto-hide UI when animSetType is 'all'
                    if (settings.animSetType !== 'all') {
                        uiTimeout = setTimeout(() => {
                            uiTimeout = null;
                            state.uiVisible = false;
                        }, 4000);
                    }`);
    console.log('1. ✓ Fixed showUI function to prevent auto-hide for Animation Set All');
} else {
    console.log('1. ⚠ showUI timeout pattern not found');
}

// Fix 2: Update updateAnimationDots function - find and replace the condition
const dotsConditionPattern = /if \(currentAnimationTracks\.length >= 3\) \{\s*animationDots\.classList\.remove\('hidden'\);/;
if (dotsConditionPattern.test(content)) {
    content = content.replace(dotsConditionPattern, `// Always show dots when animSetType is 'all', otherwise require 3+ tracks
                    if (settings.animSetType === 'all' || currentAnimationTracks.length >= 3) {
                        animationDots.classList.remove('hidden');`);
    console.log('2. ✓ Fixed updateAnimationDots function to always show dots for Animation Set All');
} else {
    console.log('2. ⚠ updateAnimationDots condition pattern not found');
}

// Fix 3: Add resetComplete event handler if it doesn't exist
if (!content.includes("events.on('resetComplete'")) {
    // Find insertion point after showUI() call
    const insertPattern = /showUI\(\);\s*events\.on\('inputEvent', showUI\);/;
    const match = content.match(insertPattern);
    if (match) {
        const resetCompleteHandler = `

                // Handle reset completion to update animation dots
                events.on('resetComplete', () => {
                    updateAnimationDots();
                    showUI();
                });`;
        
        content = content.replace(insertPattern, match[0] + resetCompleteHandler);
        console.log('3. ✓ Added resetComplete event handler');
    } else {
        console.log('3. ⚠ Could not find insertion point for resetComplete handler');
    }
} else {
    console.log('3. ✓ resetComplete event handler already exists');
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('\n✅ Targeted fixes applied to exported HTML file successfully!');
console.log('The reset dot issue should now be resolved in kling_21_5 all.html');