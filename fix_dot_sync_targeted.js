const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlFile = path.join(__dirname, 'kling_21_5 all.html');
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

console.log('Fixing dot click synchronization issue with targeted approach...');

// Split content into lines for precise targeting
const lines = htmlContent.split('\n');

// Find the dot click handler section
let dotClickStartLine = -1;
let resetIfLine = -1;
let updateAnimationDotsLine = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('dots.forEach((dot) => {')) {
        dotClickStartLine = i;
        console.log(`Found dot click handler at line ${i + 1}`);
    }
    
    if (line.includes("if (setId === 'reset') {")) {
        resetIfLine = i;
        console.log(`Found reset if statement at line ${i + 1}`);
    }
    
    if (line.includes('updateAnimationDots();') && i > resetIfLine && resetIfLine > -1) {
        updateAnimationDotsLine = i;
        console.log(`Found updateAnimationDots call at line ${i + 1}`);
        break;
    }
}

if (resetIfLine > -1 && updateAnimationDotsLine > -1) {
    // Find the closing brace of the reset if block
    let resetBlockEndLine = -1;
    let braceCount = 0;
    
    for (let i = resetIfLine; i < updateAnimationDotsLine; i++) {
        const line = lines[i];
        
        // Count opening braces
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        braceCount += openBraces - closeBraces;
        
        // When we reach the end of the reset block (braceCount becomes 0 after the initial opening)
        if (i > resetIfLine && braceCount === 0 && line.includes('}')) {
            resetBlockEndLine = i;
            console.log(`Found reset block end at line ${i + 1}`);
            break;
        }
    }
    
    if (resetBlockEndLine > -1) {
        // Insert return statement before the closing brace of reset block
        const indentation = lines[resetBlockEndLine].match(/^\s*/)[0];
        lines.splice(resetBlockEndLine, 0, `${indentation}            // Don't call updateAnimationDots() and showUI() here - wait for resetComplete`);
        lines.splice(resetBlockEndLine + 1, 0, `${indentation}            return; // Exit early to avoid calling updateAnimationDots() and showUI() immediately`);
        
        console.log('Added return statement to reset block');
        
        // Now ensure the resetComplete event handler calls updateAnimationDots() and showUI()
        let resetCompleteHandlerFound = false;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("events.on('resetComplete'")) {
                resetCompleteHandlerFound = true;
                
                // Check if it already calls updateAnimationDots
                let handlerEndLine = -1;
                let handlerBraceCount = 0;
                
                for (let j = i; j < lines.length; j++) {
                    const line = lines[j];
                    const openBraces = (line.match(/\{/g) || []).length;
                    const closeBraces = (line.match(/\}/g) || []).length;
                    
                    handlerBraceCount += openBraces - closeBraces;
                    
                    if (j > i && handlerBraceCount === 0) {
                        handlerEndLine = j;
                        break;
                    }
                }
                
                if (handlerEndLine > -1) {
                    // Check if updateAnimationDots is already called in this handler
                    let hasUpdateCall = false;
                    for (let k = i; k < handlerEndLine; k++) {
                        if (lines[k].includes('updateAnimationDots()')) {
                            hasUpdateCall = true;
                            break;
                        }
                    }
                    
                    if (!hasUpdateCall) {
                        // Add updateAnimationDots and showUI calls before the closing brace
                        const handlerIndentation = lines[handlerEndLine].match(/^\s*/)[0];
                        lines.splice(handlerEndLine, 0, `${handlerIndentation}    updateAnimationDots();`);
                        lines.splice(handlerEndLine + 1, 0, `${handlerIndentation}    showUI();`);
                        console.log('Added updateAnimationDots() and showUI() to resetComplete handler');
                    } else {
                        console.log('resetComplete handler already has updateAnimationDots() call');
                    }
                }
                break;
            }
        }
        
        if (!resetCompleteHandlerFound) {
            console.log('Warning: resetComplete event handler not found');
        }
        
        // Write the modified content back
        const modifiedContent = lines.join('\n');
        fs.writeFileSync(htmlFile, modifiedContent, 'utf8');
        
        console.log('\nDot click synchronization fix applied successfully!');
        console.log('- Reset dot now exits early to prevent immediate UI updates');
        console.log('- UI updates will happen when resetComplete event fires');
        console.log('- This should fix the two-click issue for reset dot');
    } else {
        console.log('Could not find reset block end');
    }
} else {
    console.log('Could not find reset if statement or updateAnimationDots call');
}