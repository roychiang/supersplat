// Fix script for camera transitions between animation dots 1, 2, 3
// This script patches the setAnimationTracks method in the exported HTML file

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, 'kling_21_5 1.html');

if (!fs.existsSync(htmlFilePath)) {
    console.error('HTML file not found:', htmlFilePath);
    process.exit(1);
}

console.log('Reading HTML file...');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Find and replace the setAnimationTracks method
const originalMethod = /setAnimationTracks\(tracks, trackIndex = 0\) \{[\s\S]*?\n                \}/;

const newMethod = `setAnimationTracks(tracks, trackIndex = 0) {
                    if (!tracks || tracks.length === 0) {
                        return;
                    }
            
                    // Store animation tracks
                    this.animTracks = tracks;
            
                    // Update the animation camera with selected track
                    if (this.animCamera && tracks[trackIndex]) {
                        const track = tracks[trackIndex];
                        this.animCamera.setTrack(track);
                        
                        // Update animation duration
                        if (this.state) {
                            this.state.animationDuration = track.duration || 0;
                            
                            // Trigger camera transition by temporarily changing camera mode
                            // This resets the transition timer and creates smooth transitions between tracks
                            const currentMode = this.state.cameraMode;
                            if (currentMode === 'anim') {
                                // Temporarily switch to orbit to trigger transition reset
                                this.state.cameraMode = 'orbit';
                                // Immediately switch back to anim to start transition
                                setTimeout(() => {
                                    this.state.cameraMode = 'anim';
                                }, 1);
                            }
                        }
                    }
                }`;

if (htmlContent.match(originalMethod)) {
    console.log('Found setAnimationTracks method, applying fix...');
    htmlContent = htmlContent.replace(originalMethod, newMethod);
    
    // Write the fixed content back to the file
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log('✅ Camera transition fix applied successfully!');
    console.log('The HTML file now supports smooth camera transitions between dots 1, 2, and 3.');
} else {
    console.log('❌ setAnimationTracks method not found in the expected format.');
    console.log('The file may have already been patched or has a different structure.');
}

console.log('\nFix complete. You can now test the camera transitions between animation dots.');