const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = 'M:\\Project\\supersplat\\kling_21_5 1.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// Find and remove the duplicate resetComplete firing from the second inputEvent handler
// This handler is around line 94124 and causes the double-click issue
const duplicateResetCompletePattern = /case 'reset':\s*{[\s\S]*?events\.fire\('resetComplete'\);[\s\S]*?break;\s*}/;

if (duplicateResetCompletePattern.test(content)) {
    // Replace the case 'reset' block to remove the duplicate resetComplete firing
    content = content.replace(duplicateResetCompletePattern, `case 'reset': {
                                // Reset handling is done by the first inputEvent handler
                                // No need to fire resetComplete again here
                                break;
                            }`);
    
    console.log('✓ Removed duplicate resetComplete firing from second inputEvent handler');
} else {
    console.log('⚠ Duplicate resetComplete pattern not found - may already be fixed');
}

// Write the modified content back to the file
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('✓ Fixed duplicate resetComplete issue in kling_21_5 1.html');
console.log('Reset dot should now work with single click');