#!/usr/bin/env node

/* ============================================================
   AUTO-INJECT
   1) partial.js footer script into all HTML files
   2) GA4 tag (gtag.js) + WhatsApp/call/email click tracking
   Run this once (or any time new pages are added) to bring
   every page up to date automatically.
   ============================================================ */

const fs = require('fs');
const path = require('path');

// ---------- Configuration: partial.js footer ----------
const SCRIPT_TAG = '<script src="partial.js"></script>';
const EXCLUDE_FILES = ['all-pages.html']; // Already has the script

// ---------- Configuration: GA4 ----------
const GA_ID = 'G-HVPEWJ2Z0C';

const GA_FULL_SNIPPET = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>
`;

const GA_CLICK_TRACKING = `<script>
  document.addEventListener('DOMContentLoaded', function () {
    function track(selector, eventName) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener('click', function () {
          if (typeof gtag === 'function') {
            gtag('event', eventName, {
              event_category: 'engagement',
              link_url: el.href,
              page_path: window.location.pathname
            });
          }
        });
      });
    }
    track('a[href*="wa.me"], a[href*="whatsapp.com"]', 'whatsapp_click');
    track('a[href^="tel:"]', 'phone_call_click');
    track('a[href^="mailto:"]', 'email_click');
  });
</script>
`;

// Matches both `<meta charset="UTF-8">` and `<meta charset="UTF-8" />`
const CHARSET_RE = /<meta charset="UTF-8"\s*\/?>/i;
// Matches the existing gtag config block regardless of indentation
const GA_CONFIG_RE = new RegExp(
  "gtag\\('config',\\s*'" + GA_ID + "'\\);\\s*\\n\\s*</script>"
);

// Find all HTML files in current directory
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file =>
    file.endsWith('.html') &&
    !file.includes('FIXED')
  );
}

// ---------- partial.js pass ----------
function hasScript(content) {
  return content.includes('partial.js');
}

function injectScript(content) {
  if (content.includes('</body>')) {
    return content.replace('</body>', `  ${SCRIPT_TAG}\n</body>`);
  }
  if (content.includes('</html>')) {
    return content.replace('</html>', `  ${SCRIPT_TAG}\n</html>`);
  }
  return content + `\n${SCRIPT_TAG}\n`;
}

function processFooterScript(file, content) {
  if (EXCLUDE_FILES.includes(file) || hasScript(content)) {
    return { content, changed: false, reason: 'already has partial.js' };
  }
  return { content: injectScript(content), changed: true };
}

// ---------- GA4 pass ----------
function hasGaTag(content) {
  return content.includes('gtag/js');
}

function hasClickTracking(content) {
  return content.includes('whatsapp_click');
}

function processGaTag(content) {
  if (hasClickTracking(content)) {
    return { content, changed: false, reason: 'already fully instrumented' };
  }

  if (hasGaTag(content)) {
    if (!GA_CONFIG_RE.test(content)) {
      return { content, changed: false, reason: 'WARNING: gtag present but config block not found — check manually' };
    }
    const newContent = content.replace(GA_CONFIG_RE, (match) => `${match}\n${GA_CLICK_TRACKING}`);
    return { content: newContent, changed: true, reason: 'added click tracking' };
  }

  if (!CHARSET_RE.test(content)) {
    return { content, changed: false, reason: 'WARNING: <meta charset> not found — check manually' };
  }
  const newContent = content.replace(CHARSET_RE, (match) => `${match}\n${GA_FULL_SNIPPET}${GA_CLICK_TRACKING}`);
  return { content: newContent, changed: true, reason: 'added full GA4 tag + click tracking' };
}

// ---------- Runner ----------
function processFiles() {
  const htmlFiles = findHtmlFiles('.');
  let footerProcessed = 0, footerSkipped = 0;
  let gaProcessed = 0, gaSkipped = 0, gaWarnings = 0;

  console.log('🔍 Found', htmlFiles.length, 'HTML files\n');

  htmlFiles.forEach(file => {
    const filePath = path.join('.', file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let touched = false;

    // Pass 1: footer script
    const footerResult = processFooterScript(file, content);
    if (footerResult.changed) {
      content = footerResult.content;
      touched = true;
      console.log('✅ [footer] Injected:', file);
      footerProcessed++;
    } else {
      console.log('⏭️  [footer] Skipped:', file, `(${footerResult.reason})`);
      footerSkipped++;
    }

    // Pass 2: GA4 tag + click tracking
    const gaResult = processGaTag(content);
    if (gaResult.changed) {
      content = gaResult.content;
      touched = true;
      console.log('✅ [GA4] ' + gaResult.reason + ':', file);
      gaProcessed++;
    } else if (gaResult.reason && gaResult.reason.startsWith('WARNING')) {
      console.log('⚠️  [GA4]', gaResult.reason + ':', file);
      gaWarnings++;
    } else {
      console.log('⏭️  [GA4] Skipped:', file, `(${gaResult.reason})`);
      gaSkipped++;
    }

    if (touched) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  });

  console.log('\n📊 Summary:');
  console.log('   Footer script — ✅ Processed:', footerProcessed, ' ⏭️  Skipped:', footerSkipped);
  console.log('   GA4 tracking  — ✅ Processed:', gaProcessed, ' ⏭️  Skipped:', gaSkipped, ' ⚠️  Warnings:', gaWarnings);
  console.log('\n🎉 Done! All pages now have automatic footer and GA4 tracking.');
}

// Run
try {
  processFiles();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
