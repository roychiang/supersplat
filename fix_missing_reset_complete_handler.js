const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlFilePath = path.join(__dirname, 'kling_21_5 1.html');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

console.log('Checking for resetComplete event handler...');

// Check if resetComplete event handler already exists
if (htmlContent.includes("events.on('resetComplete'")) {
    console.log('resetComplete event handler already exists');
    return;
}

// Find the location to insert the resetComplete event handler
// Look for the end of the event listeners section, before the closing script tag
const insertPattern = /\s*\/\/#\s*sourceMappingURL=index\.js\.map\s*$/m;
const match = htmlContent.match(insertPattern);

if (match) {
    // Add the resetComplete event handler
    const resetCompleteHandler = `

            // Handle reset completion to update UI
            events.on('resetComplete', () => {
                updateAnimationDots();
                showUI();
            });
`;
    
    // Insert the handler before the sourceMappingURL comment
    htmlContent = htmlContent.replace(insertPattern, resetCompleteHandler + match[0]);
    
    // Write the updated content back to the file
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    
    console.log('✓ Added resetComplete event handler to kling_21_5 1.html');
    console.log('✓ The reset dot should now work with a single click');
} else {
    console.log('⚠ Could not find insertion point for resetComplete handler');
}