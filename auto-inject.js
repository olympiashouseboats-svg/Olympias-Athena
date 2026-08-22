#!/usr/bin/env node

/* ============================================================
   AUTO-INJECT partial.js into all HTML files
   Run this once to add footer script to all pages automatically
   ============================================================ */

const fs = require('fs');
const path = require('path');

// Configuration
const SCRIPT_TAG = '<script src="partial.js"></script>';
const EXCLUDE_FILES = ['all-pages.html']; // Already has the script

// Find all HTML files in current directory
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => 
    file.endsWith('.html') && 
    !EXCLUDE_FILES.includes(file) &&
    !file.includes('FIXED')
  );
}

// Check if script already exists in file
function hasScript(content) {
  return content.includes('partial.js');
}

// Inject script before closing body tag
function injectScript(content) {
  // Try to find </body>
  if (content.includes('</body>')) {
    return content.replace('</body>', `  ${SCRIPT_TAG}\n</body>`);
  }
  
  // If no </body>, add before </html>
  if (content.includes('</html>')) {
    return content.replace('</html>', `  ${SCRIPT_TAG}\n</html>`);
  }
  
  // Last resort: append to end
  return content + `\n${SCRIPT_TAG}\n`;
}

// Process all HTML files
function processFiles() {
  const htmlFiles = findHtmlFiles('.');
  let processed = 0;
  let skipped = 0;
  
  console.log('🔍 Found', htmlFiles.length, 'HTML files\n');
  
  htmlFiles.forEach(file => {
    const filePath = path.join('.', file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (hasScript(content)) {
      console.log('⏭️  Skipped:', file, '(already has script)');
      skipped++;
    } else {
      content = injectScript(content);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('✅ Injected:', file);
      processed++;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log('   ✅ Processed:', processed, 'files');
  console.log('   ⏭️  Skipped:', skipped, 'files');
  console.log('\n🎉 Done! All pages now have automatic footer.');
}

// Run
try {
  processFiles();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
