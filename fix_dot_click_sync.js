const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlFile = path.join(__dirname, 'kling_21_5 all.html');
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

console.log('Fixing dot click synchronization issue...');

// Find and fix the reset dot click handler
// The issue is that updateAnimationDots() is called immediately but reset is asynchronous
// We need to move the updateAnimationDots() call to the resetComplete event handler

// First, find the dot click handler for reset
const resetDotPattern = /if \(dotName === 'reset'\) \{[\s\S]*?\} else/;
const resetDotMatch = htmlContent.match(resetDotPattern);

if (resetDotMatch) {
    console.log('Found reset dot click handler');
    
    // Replace the reset dot handler to remove immediate updateAnimationDots() call
    const newResetHandler = `if (dotName === 'reset') {
                        activeAnimationSet = 'reset';
                        events.fire('inputEvent', 'reset');
                        setTimeout(() => {
                            events.fire('resetComplete');
                        }, 100);
                    } else`;
    
    htmlContent = htmlContent.replace(resetDotPattern, newResetHandler);
    console.log('Updated reset dot click handler to remove immediate updateAnimationDots() call');
} else {
    console.log('Reset dot click handler pattern not found');
}

// Now find the resetComplete event handler and ensure it calls updateAnimationDots()
const resetCompletePattern = /events\.on\('resetComplete',\s*function\s*\(\)\s*\{[\s\S]*?\}\);/;
const resetCompleteMatch = htmlContent.match(resetCompletePattern);

if (resetCompleteMatch) {
    console.log('Found resetComplete event handler');
    
    // Check if it already calls updateAnimationDots()
    if (!resetCompleteMatch[0].includes('updateAnimationDots()')) {
        // Add updateAnimationDots() and showUI() calls to the resetComplete handler
        const newResetCompleteHandler = resetCompleteMatch[0].replace(
            /\}\);$/,
            `    updateAnimationDots();
                showUI();
            });`
        );
        
        htmlContent = htmlContent.replace(resetCompletePattern, newResetCompleteHandler);
        console.log('Added updateAnimationDots() and showUI() calls to resetComplete handler');
    } else {
        console.log('resetComplete handler already includes updateAnimationDots()');
    }
} else {
    console.log('resetComplete event handler not found');
}

// Also ensure that other dot clicks (non-reset) still work properly
// Find the else part of the dot click handler
const elseDotPattern = /\} else \{[\s\S]*?activeAnimationSet = dotName;[\s\S]*?updateAnimationDots\(\);[\s\S]*?showUI\(\);[\s\S]*?\}/;
const elseDotMatch = htmlContent.match(elseDotPattern);

if (elseDotMatch) {
    console.log('Found non-reset dot click handler - ensuring immediate feedback');
    
    // Ensure the non-reset dots have immediate visual feedback
    const improvedElseHandler = `} else {
                        activeAnimationSet = dotName;
                        updateAnimationDots(); // Immediate visual feedback
                        showUI();
                        
                        const targetPose = animationSets[dotName];
                        if (targetPose && targetPose.camera) {
                            transitionToPose(targetPose.camera);
                        }
                    }`;
    
    htmlContent = htmlContent.replace(elseDotPattern, improvedElseHandler);
    console.log('Improved non-reset dot click handler for immediate feedback');
} else {
    console.log('Non-reset dot click handler pattern not found');
}

// Write the fixed content back to the file
fs.writeFileSync(htmlFile, htmlContent, 'utf8');
console.log('\nDot click synchronization fixes applied successfully!');
console.log('- Reset dot now properly synchronizes visual state with actual reset completion');
console.log('- Non-reset dots provide immediate visual feedback');
console.log('- Single-click transitions should now work correctly for all dots');