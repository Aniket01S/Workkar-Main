const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace className="... material-symbols-outlined ..." with className="... material-symbols-outlined notranslate ..."
    // Need to be careful not to add it multiple times
    
    // regex to find material-symbols-outlined inside className="..." or className={`...`}
    // Instead of complex regex, let's just replace 'material-symbols-outlined' with 'material-symbols-outlined notranslate'
    // but only if it's not already followed by 'notranslate'
    let original = content;
    
    content = content.replace(/material-symbols-outlined(?!\s*notranslate)/g, 'material-symbols-outlined notranslate');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Modified ${modifiedFiles} files.`);
