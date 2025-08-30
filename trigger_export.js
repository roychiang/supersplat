// Script to trigger HTML viewer export programmatically
// This will re-export the HTML file with the latest fixes applied

console.log('Triggering HTML viewer export...');

// Wait for the application to be fully loaded
setTimeout(() => {
    try {
        // Get the events system from the global scope
        const events = window.events || window.app?.events;
        
        if (!events) {
            console.error('Events system not found. Make sure the application is fully loaded.');
            return;
        }
        
        // Trigger the viewer export
        events.invoke('scene.export', 'viewer').then(() => {
            console.log('Export dialog opened successfully');
        }).catch((error) => {
            console.error('Failed to trigger export:', error);
        });
        
    } catch (error) {
        console.error('Error triggering export:', error);
    }
}, 2000); // Wait 2 seconds for app to load

console.log('Export trigger script loaded. Will attempt export in 2 seconds...');