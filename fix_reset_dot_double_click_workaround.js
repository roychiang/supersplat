const fs = require('fs');
const path = require('path');

// Path to the HTML file
const htmlFilePath = path.join(__dirname, 'kling_21_5 1.html');

// Read the HTML file
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Find and replace the reset dot click handler to fire two events
const originalResetHandler = `if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Reset camera to initial position with smooth transition
                            events.fire('inputEvent', 'reset');
                            // Add setTimeout to fire second reset event after 50ms for proper UI update
                            events.fire('resetComplete');`;

const newResetHandler = `if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Workaround: Fire two reset events to ensure proper camera transition
                            events.fire('inputEvent', 'reset');
                            events.fire('resetComplete');
                            // Fire second set of events after a small delay to simulate double-click
                            setTimeout(() => {
                                events.fire('inputEvent', 'reset');
                                events.fire('resetComplete');
                            }, 10);`;

// Replace the reset handler
if (htmlContent.includes(originalResetHandler)) {
    htmlContent = htmlContent.replace(originalResetHandler, newResetHandler);
    console.log('✓ Successfully modified reset dot click handler to fire two events');
} else {
    console.log('✗ Original reset handler pattern not found');
    console.log('Searching for alternative patterns...');
    
    // Try to find the reset handler with different formatting
    const resetHandlerRegex = /if \(setId === 'reset'\) \{[\s\S]*?events\.fire\('resetComplete'\);/;
    const match = htmlContent.match(resetHandlerRegex);
    
    if (match) {
        const foundHandler = match[0];
        console.log('Found reset handler:', foundHandler.substring(0, 100) + '...');
        
        // Replace with the new handler
        const replacementHandler = `if (setId === 'reset') {
                            activeAnimationSet = 'reset';
                            // Workaround: Fire two reset events to ensure proper camera transition
                            events.fire('inputEvent', 'reset');
                            events.fire('resetComplete');
                            // Fire second set of events after a small delay to simulate double-click
                            setTimeout(() => {
                                events.fire('inputEvent', 'reset');
                                events.fire('resetComplete');
                            }, 10);`;
        
        htmlContent = htmlContent.replace(foundHandler, replacementHandler);
        console.log('✓ Successfully modified reset dot click handler using regex pattern');
    } else {
        console.log('✗ Could not find reset handler to modify');
        process.exit(1);
    }
}

// Write the modified content back to the file
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('✓ HTML file updated successfully');
console.log('The reset dot should now work with a single click by firing two events automatically.');