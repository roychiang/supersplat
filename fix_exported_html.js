const fs = require('fs');
const path = require('path');

// Read the exported HTML file
const htmlFilePath = path.join(__dirname, 'kling_21_5 all.html');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

console.log('Applying fixes to exported HTML file...');

let fixesApplied = 0;

// Fix 1: Update updateAnimationDots function to always show dots when animSetType is 'all'
const updateAnimationDotsRegex = /(\/\/ Function to update animation dots visibility and state\s+const updateAnimationDots = \(\) => \{\s+if \(currentAnimationTracks\.length >= 3\) \{)/;
if (updateAnimationDotsRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(
        /(\/\/ Function to update animation dots visibility and state\s+const updateAnimationDots = \(\) => \{)\s+if \(currentAnimationTracks\.length >= 3\) \{/,
        '$1\n                    const animSetType = settings.animSetType || \'individual\';\n                    // Always show dots when animSetType is \'all\', otherwise check track count\n                    if (animSetType === \'all\' || currentAnimationTracks.length >= 3) {'
    );
    console.log('✓ Fixed updateAnimationDots function');
    fixesApplied++;
} else {
    console.log('⚠ updateAnimationDots function not found or already fixed');
}

// Fix 2: Update showUI function to not auto-hide UI when animSetType is 'all'
const showUIRegex = /const showUI = \(\) => \{\s+if \(uiTimeout\) \{\s+clearTimeout\(uiTimeout\);\s+\}\s+state\.uiVisible = true;\s+uiTimeout = setTimeout\(\(\) => \{\s+uiTimeout = null;\s+state\.uiVisible = false;\s+\}, 4000\);\s+\};/;
if (showUIRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(
        showUIRegex,
        `const showUI = () => {
                    if (uiTimeout) {
                        clearTimeout(uiTimeout);
                    }
                    state.uiVisible = true;
                    const animSetType = settings.animSetType || 'individual';
                    if (animSetType !== 'all') {
                        uiTimeout = setTimeout(() => {
                            uiTimeout = null;
                            state.uiVisible = false;
                        }, 4000);
                    }
                };`
    );
    console.log('✓ Fixed showUI function');
    fixesApplied++;
} else {
    console.log('⚠ showUI function not found or already fixed');
}

// Fix 3: Remove setTimeout delay from dot click handler for single-click behavior
const setTimeoutRegex = /\/\/ Set the animation track after a brief delay to allow transition\s+setTimeout\(\(\) => \{\s+viewer\.setAnimationTracks\(currentAnimationTracks, setIndex\);\s+state\.animationPaused = false;\s+events\.fire\('setAnimationTime', 0\);\s+\}, 200\);/;
if (setTimeoutRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(
        setTimeoutRegex,
        `// Set the animation track immediately for single-click behavior
                                        viewer.setAnimationTracks(currentAnimationTracks, setIndex);
                                        state.animationPaused = false;
                                        events.fire('setAnimationTime', 0);`
    );
    console.log('✓ Fixed dot click handler setTimeout');
    fixesApplied++;
} else {
    console.log('⚠ Dot click handler setTimeout not found or already fixed');
}

// Write the fixed content back to the file
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

console.log(`\nCompleted! Applied ${fixesApplied} fixes to the exported HTML file.`);
console.log('\nFixes applied:');
console.log('1. Animation dots will always be visible when animSetType is "all"');
console.log('2. UI elements will not auto-hide when animSetType is "all"');
console.log('3. Dot transitions will work with single clicks (no setTimeout delay)');