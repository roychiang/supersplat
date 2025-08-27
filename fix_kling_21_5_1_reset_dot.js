const fs = require('fs');
const path = require('path');

// Read the HTML file
const filePath = path.join(__dirname, 'kling_21_5 1.html');
let content = fs.readFileSync(filePath, 'utf8');

// Find and fix the reset dot click handler
const resetPattern = /if \(setId === 'reset'\) \{\s*activeAnimationSet = 'reset';\s*\/\/ Reset camera to initial position with smooth transition\s*events\.fire\('inputEvent', 'reset'\);\s*\} else \{/;

const replacement = `if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Reset camera to initial position with smooth transition
                            events.fire('inputEvent', 'reset');
                            return; // Prevent immediate UI updates, let resetComplete event handle them
                        } else {`;

if (resetPattern.test(content)) {
    content = content.replace(resetPattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully fixed reset dot click synchronization in kling_21_5 1.html');
    console.log('The reset dot now prevents immediate UI updates and relies on the resetComplete event.');
} else {
    console.log('❌ Could not find the reset dot click handler pattern in the file.');
    console.log('The file may have already been fixed or the pattern has changed.');
}