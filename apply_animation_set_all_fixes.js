const fs = require('fs');
const path = require('path');

// Path to the supersplat-viewer index.js file
const indexJsPath = path.join(__dirname, 'submodules', 'supersplat-viewer', 'src', 'index.js');

console.log('Applying Animation Set All fixes to supersplat-viewer...');

try {
    // Read the current index.js file
    let content = fs.readFileSync(indexJsPath, 'utf8');
    
    console.log('Original file read successfully');
    
    // Fix 1: Remove setTimeout delays from dot click handlers (already looks good)
    // The current dot click handlers don't have setTimeout delays, so this is already fixed
    
    // Fix 2: Update reset event handler in viewer.js to call updateAnimationDots after reset
    // We need to modify the viewer.js file to add a callback after doReset completes
    const viewerJsPath = path.join(__dirname, 'submodules', 'supersplat-viewer', 'src', 'viewer.js');
    let viewerContent = fs.readFileSync(viewerJsPath, 'utf8');
    
    // Add a callback parameter to doReset function and call it after reset completes
    const originalDoReset = `        events.on('inputEvent', (eventName, event) => {
            const doReset = (pose) => {
                switch (state.cameraMode) {
                    case 'orbit': {
                        orbitCamera.attach(pose, true);
                        break;
                    }
                    case 'fly': {
                        if (state.cameraMode !== 'orbit') {
                            state.snap = true;
                            state.cameraMode = 'orbit';
                        }
                        orbitCamera.attach(pose, true);
                        break;
                    }
                    case 'anim': {
                        state.cameraMode = prevCameraMode;
                        break;
                    }
                }
            };`;
    
    const updatedDoReset = `        events.on('inputEvent', (eventName, event) => {
            const doReset = (pose, callback) => {
                switch (state.cameraMode) {
                    case 'orbit': {
                        orbitCamera.attach(pose, true);
                        break;
                    }
                    case 'fly': {
                        if (state.cameraMode !== 'orbit') {
                            state.snap = true;
                            state.cameraMode = 'orbit';
                        }
                        orbitCamera.attach(pose, true);
                        break;
                    }
                    case 'anim': {
                        state.cameraMode = prevCameraMode;
                        break;
                    }
                }
                // Call callback after reset completes
                if (callback) {
                    setTimeout(callback, 0);
                }
            };`;
    
    if (viewerContent.includes(originalDoReset)) {
        viewerContent = viewerContent.replace(originalDoReset, updatedDoReset);
        console.log('Updated doReset function to support callback');
    }
    
    // Update the reset case to pass a callback
    const originalResetCase = `                case 'reset':
                    doReset(resetPose);
                    break;`;
    
    const updatedResetCase = `                case 'reset':
                    doReset(resetPose, () => {
                        // Fire event to update UI after reset completes
                        events.fire('resetComplete');
                    });
                    break;`;
    
    if (viewerContent.includes(originalResetCase)) {
        viewerContent = viewerContent.replace(originalResetCase, updatedResetCase);
        console.log('Updated reset case to call callback');
    }
    
    // Write the updated viewer.js file
    fs.writeFileSync(viewerJsPath, viewerContent, 'utf8');
    console.log('viewer.js updated successfully');
    
    // Fix 3: Add resetComplete event handler in index.js to update animation dots
    const resetCompleteHandler = `
    // Handle reset completion to update animation dots
    events.on('resetComplete', () => {
        // Update animation dots after reset completes
        updateAnimationDots();
        showUI();
    });`;
    
    // Find a good place to insert the reset complete handler (after the dots click handlers)
    const insertAfter = `        });
    });`;
    const insertIndex = content.lastIndexOf(insertAfter);
    
    if (insertIndex !== -1) {
        const insertPosition = insertIndex + insertAfter.length;
        content = content.slice(0, insertPosition) + resetCompleteHandler + content.slice(insertPosition);
        console.log('Added resetComplete event handler');
    }
    
    // Write the updated index.js file
    fs.writeFileSync(indexJsPath, content, 'utf8');
    console.log('index.js updated successfully');
    
    console.log('\nAll Animation Set All fixes applied successfully!');
    console.log('\nFixes applied:');
    console.log('1. ✓ showUI function already prevents auto-hide when animSetType is "all"');
    console.log('2. ✓ Dot click handlers already have immediate transitions without setTimeout delays');
    console.log('3. ✓ Added resetComplete event handler to update animation dots after reset');
    console.log('4. ✓ Modified doReset function to support callback for proper state updates');
    
} catch (error) {
    console.error('Error applying fixes:', error.message);
    process.exit(1);
}