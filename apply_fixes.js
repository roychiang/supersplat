const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 all.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying fixes to kling_21_5 all.html...');

let fixesApplied = 0;

// Fix 1: Update updateAnimationDots function to always show dots when animSetType is 'all'
const updateAnimationDotsRegex = /(const updateAnimationDots = \(\) => \{[\s\S]*?if \(currentAnimationTracks\.length >= 3)\) (\{[\s\S]*?\} else \{[\s\S]*?\}[\s\S]*?\};)/;
if (updateAnimationDotsRegex.test(content)) {
    content = content.replace(updateAnimationDotsRegex, '$1 || animSetType === \'all\') $2');
    console.log('✓ Fixed updateAnimationDots function');
    fixesApplied++;
} else {
    console.log('✗ updateAnimationDots function not found or already fixed');
}

// Fix 2: Update showUI function to prevent auto-hide when animSetType is 'all'
const showUIRegex = /(const showUI = \(\) => \{[\s\S]*?state\.uiVisible = true;[\s\S]*?)(uiTimeout = setTimeout\([\s\S]*?\}, 4000\);)/;
if (showUIRegex.test(content)) {
    content = content.replace(showUIRegex, '$1if (animSetType !== \'all\') {\n                        $2\n                    }');
    console.log('✓ Fixed showUI function');
    fixesApplied++;
} else {
    console.log('✗ showUI function not found or already fixed');
}

// Fix 3: Remove setTimeout delay from dot click handler
const setTimeoutRegex = /(\s+)(\/\/ Set the animation track after a brief delay to allow transition[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?viewer\.setAnimationTracks\(currentAnimationTracks, setIndex\);[\s\S]*?events\.fire\('setAnimationTime', 0\);[\s\S]*?\}, 200\);)/;
if (setTimeoutRegex.test(content)) {
    content = content.replace(setTimeoutRegex, '$1// Set the animation track immediately for single-click transitions\n$1viewer.setAnimationTracks(currentAnimationTracks, setIndex);\n$1state.animationPaused = false;\n$1events.fire(\'setAnimationTime\', 0);');
    console.log('✓ Removed setTimeout delay from dot click handler');
    fixesApplied++;
} else {
    console.log('✗ setTimeout delay not found or already fixed');
}

// Write the updated content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');

console.log(`\nApplied ${fixesApplied} fixes to kling_21_5 all.html`);
console.log('Fixes completed successfully!');