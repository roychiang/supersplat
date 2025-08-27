const fs = require('fs');
const path = require('path');

console.log('Fixing reset dot setTimeout issue in exported HTML...');

const htmlPath = 'M:\\Project\\supersplat\\kling_21_5 1.html';

try {
    let content = fs.readFileSync(htmlPath, 'utf8');
    
    // Find and replace the setTimeout in reset dot handler
    const oldPattern = `// Add setTimeout to fire second reset event after 50ms for proper UI update
                            setTimeout(() => {
                                events.fire('resetComplete');
                            }, 50);`;
    
    const newPattern = `// Fire resetComplete event immediately for single-click behavior
                            events.fire('resetComplete');`;
    
    if (content.includes(oldPattern)) {
        content = content.replace(oldPattern, newPattern);
        fs.writeFileSync(htmlPath, content, 'utf8');
        console.log('✅ Successfully removed setTimeout from reset dot handler');
        console.log('✅ Reset dot should now work with single click');
    } else {
        console.log('❌ Could not find the setTimeout pattern in reset dot handler');
        
        // Try alternative pattern matching
        const altPattern = /setTimeout\(\(\) => \{\s*events\.fire\('resetComplete'\);\s*\}, 50\);/;
        if (content.match(altPattern)) {
            content = content.replace(altPattern, "events.fire('resetComplete');");
            fs.writeFileSync(htmlPath, content, 'utf8');
            console.log('✅ Successfully removed setTimeout using alternative pattern');
            console.log('✅ Reset dot should now work with single click');
        } else {
            console.log('❌ Could not find setTimeout pattern with alternative regex');
        }
    }
    
} catch (error) {
    console.error('❌ Error fixing reset dot timeout:', error.message);
}