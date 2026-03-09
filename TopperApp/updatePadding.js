const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src/screens');

// Helper to get relative path to Theme.js
function getRelativeThemePath(filePath) {
    const screensDepth = filePath.split(path.sep).length - screensDir.split(path.sep).length;
    let relativePath = '';
    for (let i = 0; i < screensDepth; i++) {
        relativePath += '../';
    }
    return relativePath + 'theme/Theme'; // since it's going up from screens/[maybe deeper] to src/theme/Theme
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Check if there is a container style with paddingHorizontal
            const containerRegex = /(container\s*:\s*\{[^}]*?paddingHorizontal\s*:\s*)(\d+)/g;
            
            if (containerRegex.test(content)) {
                // Replace the paddingHorizontal explicitly in container styles
                content = content.replace(containerRegex, '$1Theme.layout.screenPadding');
                
                // Add import if Theme is not imported
                if (!content.includes('import { Theme }') && !content.includes('import {Theme}')) {
                    // find relative path
                    let themePath = '';
                    if (dir === screensDir) {
                        themePath = '../theme/Theme';
                    } else {
                        // one folder deeper like screens/student
                        themePath = '../../theme/Theme';
                    }
                    
                    // Add import gracefully after react imports
                    const importStatement = `import { Theme } from '${themePath}';\n`;
                    content = content.replace(/(import React.*?;\n)/, `$1${importStatement}`);
                }
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated padding in ${fullPath}`);
            }
        }
    });
}

processDirectory(screensDir);
console.log('Finished updating paddings.');
