const fs = require('fs');
const path = require('path');

// Read the HTML file
const filePath = 'M:\\Project\\supersplat\\1402px-Jacques-Louis_David,_Le_Serment_des_Horaces.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying fixes to Jacques-Louis David HTML file...');

// Fix 1: Remove state.cameraMode = 'anim' from non-reset dots
const fix1Pattern = /(\/\/ Set animation tracks and switch to animation mode for smooth camera transitions\s+viewer\.setAnimationTracks\(currentAnimationTracks, setIndex\);\s+)state\.cameraMode = 'anim'; \/\/ This triggers smooth camera transition\s+(state\.animationPaused = false;)/;
const fix1Replacement = '$1$2';

if (fix1Pattern.test(content)) {
    content = content.replace(fix1Pattern, fix1Replacement);
    console.log('✓ Removed state.cameraMode = "anim" from non-reset dots');
} else {
    console.log('✗ Could not find state.cameraMode = "anim" pattern to remove');
}

// Fix 2: Change reset dot timeout to fire inputEvent reset instead of resetComplete
const fix2Pattern = /(\/\/ Add setTimeout to fire second reset event after 50ms for proper UI update\s+setTimeout\(\(\) => \{\s+)events\.fire\('resetComplete'\);(\s+\}, 50\);)/;
const fix2Replacement = '$1updateAnimationDots();\n                                showUI();\n                                events.fire(\'inputEvent\', \'reset\');$2';

if (fix2Pattern.test(content)) {
    content = content.replace(fix2Pattern, fix2Replacement);
    console.log('✓ Changed reset dot timeout to fire inputEvent reset');
} else {
    console.log('✗ Could not find resetComplete pattern to replace');
}

// Fix 3: Update comment for non-reset dots
const fix3Pattern = /\/\/ Set animation tracks and switch to animation mode for smooth camera transitions/;
const fix3Replacement = '// Always use immediate switch for consistent single-click behavior';

if (fix3Pattern.test(content)) {
    content = content.replace(fix3Pattern, fix3Replacement);
    console.log('✓ Updated comment for non-reset dots');
} else {
    console.log('✗ Could not find comment pattern to update');
}

// Fix 4: Update reset timeout comment
const fix4Pattern = /\/\/ Add setTimeout to fire second reset event after 50ms for proper UI update/;
const fix4Replacement = '// Workaround: Add delayed second reset to ensure UI updates properly';

if (fix4Pattern.test(content)) {
    content = content.replace(fix4Pattern, fix4Replacement);
    console.log('✓ Updated reset timeout comment');
} else {
    console.log('✗ Could not find reset timeout comment to update');
}

// Write the fixed content back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ Fixes applied successfully to Jacques-Louis David HTML file!');
console.log('\nSummary of changes:');
console.log('- Removed state.cameraMode = "anim" from non-reset dots for immediate switching');
console.log('- Changed reset dot to fire inputEvent reset instead of resetComplete');
console.log('- Updated comments to match working implementation');