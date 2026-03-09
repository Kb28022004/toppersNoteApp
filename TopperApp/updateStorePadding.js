const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/screens/student/Store.jsx',
    'src/screens/student/AllToppers.jsx',
    'src/screens/topper/TopperDashboard.jsx',
    'src/screens/topper/TopperHome.jsx',
];

targetFiles.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // add import
    if (!content.includes('import { Theme }') && !content.includes('import {Theme}')) {
        content = content.replace(/(import React.*?;\n)/, `$1import { Theme } from '../../theme/Theme';\n`);
    }

    // replace paddingHorizontal: 20
    content = content.replace(/paddingHorizontal:\s*20/g, 'paddingHorizontal: Theme.layout.screenPadding');
    content = content.replace(/paddingLeft:\s*20/g, 'paddingLeft: Theme.layout.screenPadding');
    content = content.replace(/paddingRight:\s*20/g, 'paddingRight: Theme.layout.screenPadding');

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${fullPath}`);
});
