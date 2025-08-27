const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'kling_21_5 1.html');
let content = fs.readFileSync(htmlPath, 'utf8');

console.log('Applying fixes to kling_21_5 1.html...');

// Fix 1: Update updateAnimationDots function to always show dots when animSetType is 'all'
const updateAnimationDotsRegex = /(const updateAnimationDots = \(\) => {\s*)(if \(currentAnimationTracks\.length >= 3\))/;
if (updateAnimationDotsRegex.test(content)) {
    content = content.replace(updateAnimationDotsRegex, 
        '$1const animSetType = settings.animSetType || \'individual\';\n                    // Always show dots when animSetType is \'all\', otherwise check track count\n                    if (animSetType === \'all\' || currentAnimationTracks.length >= 3)');
    console.log('✓ Fixed updateAnimationDots function');
} else {
    console.log('✗ Could not find updateAnimationDots function pattern');
}

// Fix 2: Update showUI function to prevent auto-hide when animSetType is 'all'
const showUIRegex = /(const showUI = \(\) => {[\s\S]*?)(uiTimeout = setTimeout\(\(\) => {[\s\S]*?}, 4000\);)/;
if (showUIRegex.test(content)) {
    content = content.replace(showUIRegex, 
        '$1const animSetType = settings.animSetType || \'individual\';\n                    if (animSetType !== \'all\') {\n                        $2\n                    }');
    console.log('✓ Fixed showUI function');
} else {
    console.log('✗ Could not find showUI function pattern');
}

// Fix 3: Remove setTimeout delays from dot click handlers
const dotClickRegex = /(setTimeout\(\(\) => {\s*viewer\.setAnimationTracks\([^}]*}, 200\);)/g;
if (dotClickRegex.test(content)) {
    content = content.replace(dotClickRegex, 
        'viewer.setAnimationTracks(currentAnimationTracks, setIndex);\n                                            updateAnimationDots();\n                                            showUI();');
    console.log('✓ Removed setTimeout delays from dot click handlers');
} else {
    console.log('✗ Could not find setTimeout delays in dot click handlers');
}

// Write the fixed content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');

console.log('\nFixes applied successfully!');
console.log('1. Animation dots will always be visible when animSetType is "all"');
console.log('2. UI elements will not auto-hide when animSetType is "all"');
console.log('3. Dot-to-dot transitions now work with single clicks (no setTimeout delays)');