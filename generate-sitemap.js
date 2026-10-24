const fs = require('fs');

// Read pages registry
let pages = [];
try {
  pages = JSON.parse(fs.readFileSync('pages-registry.json', 'utf-8'));
} catch (e) {
  console.warn('⚠️  No pages-registry.json found, scanning HTML files...');
  
  // Fallback: scan HTML files
  const files = fs.readdirSync('.')
    .filter(f => f.endsWith('.html') && !f.includes('FIXED'));
  
  pages = files.map(file => ({
    url: file,
    title: file.replace('.html', '').replace(/-/g, ' '),
    priority: file === 'index.html' ? 1.0 : 0.5,
    lastModified: new Date().toISOString().split('T')[0]
  }));
}

const domain = 'https://olympiasathena.com';
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

pages.forEach(page => {
  const url = page.url.startsWith('/') ? page.url : `/${page.url}`;
  const loc = url === '/index.html' ? domain + '/' : domain + url;
  const lastmod = page.lastModified || new Date().toISOString().split('T')[0];
  const priority = page.priority || 0.5;
  const changefreq = priority >= 0.9 ? 'daily' : priority >= 0.7 ? 'weekly' : 'monthly';
  
  xml += '  <url>\n';
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>';
fs.writeFileSync('sitemap.xml', xml, 'utf-8');
console.log(`✅ Sitemap generated with ${pages.length} pages`);
