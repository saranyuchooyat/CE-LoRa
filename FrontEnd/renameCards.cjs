const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
    { old: /Cardno2/g, new: 'SummaryCard' },
    { old: /CardFull/g, new: 'DataTableCard' },
    { old: /Cardno5/g, new: 'DataTableCard' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const r of replacements) {
                content = content.replace(r.old, r.new);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);

// Now rename the actual files
const cardDir = path.join(srcDir, 'components', 'Card');
if (fs.existsSync(path.join(cardDir, 'Cardno2.jsx'))) {
    fs.renameSync(path.join(cardDir, 'Cardno2.jsx'), path.join(cardDir, 'SummaryCard.jsx'));
    console.log('Renamed Cardno2.jsx to SummaryCard.jsx');
}
if (fs.existsSync(path.join(cardDir, 'Cardno5.jsx'))) {
    fs.renameSync(path.join(cardDir, 'Cardno5.jsx'), path.join(cardDir, 'DataTableCard.jsx'));
    console.log('Renamed Cardno5.jsx to DataTableCard.jsx');
}
