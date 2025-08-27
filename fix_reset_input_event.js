const fs = require('fs');
const path = require('path');

// Read the HTML file
const filePath = path.join(__dirname, 'kling_21_5 1.html');
let content = fs.readFileSync(filePath, 'utf8');

// Find the inputEvent handler and add reset case
const searchPattern = /events\.on\('inputEvent', async \(eventName, event\) => {\s*switch \(eventName\) {\s*case 'dblclick': {[\s\S]*?break;\s*}\s*}\s*}\);/;

const match = content.match(searchPattern);
if (match) {
    const originalHandler = match[0];
    
    // Add reset case before the closing of switch statement
    const newHandler = originalHandler.replace(
        /(case 'dblclick': {[\s\S]*?break;\s*})(\s*}\s*}\);)/,
        `$1
                            case 'reset': {
                                // Fire resetComplete event after reset operation
                                events.fire('resetComplete');
                                break;
                            }$2`
    );
    
    // Replace in content
    content = content.replace(originalHandler, newHandler);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully added reset case to inputEvent handler in kling_21_5 1.html');
} else {
    console.log('Could not find inputEvent handler pattern in kling_21_5 1.html');
}