const fs = require('fs');
const path = require('path');

const SCRIPT_TAG = '<script src="partial.js"></script>';
const EXCLUDE = ['all-pages.html'];

function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(f => 
    f.endsWith('.html') && 
    !EXCLUDE.includes(f) &&
    !f.includes('FIXED') &&
    !f.startsWith('.')
  );
}

function injectScript(content) {
  if (content.includes('partial.js')) return content;
  if (content.includes('</body>')) {
    return content.replace('</body>', `  ${SCRIPT_TAG}\n</body>`);
  }
  return content + `\n${SCRIPT_TAG}\n`;
}

const files = findHtmlFiles('.');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('partial.js')) {
    content = injectScript(content);
    fs.writeFileSync(file, content, 'utf-8');
    console.log('✅ Injected:', file);
    count++;
  }
});

console.log('📊 Total injected:', count, 'files');
