// Test script to verify the fixes are working
// This script will add console logging to help debug the issues

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, '1402px-Jacques-Louis_David,_Le_Serment_des_Horaces.html');
let content = fs.readFileSync(htmlFile, 'utf8');

// Add debug logging to the dot click handler
const debugLogging = `
                        console.log('Dot clicked:', setId);
                        console.log('Active animation set before:', activeAnimationSet);
`;

// Add debug logging after the setId assignment
content = content.replace(
    /const setId = dot\.dataset\.set;/,
    `const setId = dot.dataset.set;${debugLogging}`
);

// Add debug logging to resetComplete event
content = content.replace(
    /events\.on\('resetComplete', \(\) => {/,
    `events.on('resetComplete', () => {
                    console.log('resetComplete event fired');`
);

// Add debug logging to camera mode changes
content = content.replace(
    /state\.cameraMode = 'anim';/g,
    `state.cameraMode = 'anim';
                                console.log('Camera mode set to anim');`
);

fs.writeFileSync(htmlFile, content);
console.log('Debug logging added to HTML file. Check browser console for debug messages.');