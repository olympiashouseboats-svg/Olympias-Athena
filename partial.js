/* ============================================================
   OLYMPIAS ATHENA — partial.js
   Universal Footer System with Auto Page Discovery
   Domain: olympiasathena.com
   ============================================================ */

'use strict';

(function initPartialFooter() {
  
  // ===== CONFIGURATION =====
  const CONFIG = {
    CACHE_KEY: 'olympias_pages_cache',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    REGISTRY_URL: './pages-registry.json', // Will be replaced with Firestore later
    MAX_CATEGORY_LINKS: 8,
    ENABLE_SCHEMA: true
  };

  const SITE_INFO = {
    name: 'Olympias Athena Group of Houseboats',
    domain: 'olympiasathena.com',
    phone: '+919596431735',
    email: 'guroosaif6@gmail.com',
    address: 'Dal Lake, Boulevard Road, Ghat No.13, Srinagar, J&K 190001',
    coordinates: { lat: '34.0837', lng: '74.8262' }
  };

  // ===== CACHE MANAGEMENT =====
  function getCachedPages() {
    try {
      const cached = localStorage.getItem(CONFIG.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const now = Date.now();
      
      if (now - data.timestamp < CONFIG.CACHE_DURATION) {
        return data.pages;
      }
      localStorage.removeItem(CONFIG.CACHE_KEY);
      return null;
    } catch (e) {
      return null;
    }
  }

  function setCachedPages(pages) {
    try {
      const data = { pages, timestamp: Date.now() };
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache pages:', e);
    }
  }

  // ===== FETCH PAGES =====
  async function fetchPages() {
    // Try cache first
    const cached = getCachedPages();
    if (cached) return cached;

    try {
      const response = await fetch(CONFIG.REGISTRY_URL);
      if (!response.ok) throw new Error('Failed to fetch registry');
      
      const pages = await response.json();
      setCachedPages(pages);
      return pages;
    } catch (e) {
      console.error('Failed to load page registry:', e);
      return getFallbackPages();
    }
  }

  // ===== FALLBACK PAGES (if registry fails) =====
  function getFallbackPages() {
    return [
      { url: 'index.html', title: 'Home', category: 'main', priority: 1.0 },
      { url: 'about.html', title: 'About Us', category: 'main', priority: 0.9 },
      { url: 'services.html', title: 'Services', category: 'main', priority: 0.9 },
      { url: 'rooms.html', title: 'Rooms', category: 'main', priority: 0.9 },
      { url: 'gallery.html', title: 'Gallery', category: 'main', priority: 0.8 },
      { url: 'contact.html', title: 'Contact', category: 'main', priority: 0.8 },
      { url: 'terms.html', title: 'Terms & Conditions', category: 'legal', priority: 0.3 },
      { url: 'privacy.html', title: 'Privacy Policy', category: 'legal', priority: 0.3 }
    ];
  }

  // ===== CATEGORIZE PAGES =====
  function categorizePages(pages) {
    const categories = {};

    // Group pages by their category
    pages.forEach(page => {
      const cat = page.category || 'other';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(page);
    });

    // Sort each category by priority
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
    });

    return categories;
  }

  // ===== BUILD FOOTER HTML =====
  function buildFooterHTML(categories) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Category display names
    const categoryNames = {
      'main': 'Quick Links',
      'destinations': 'Top Destinations',
      'services': 'Our Services',
      'business': 'Business Pages',
      'legal': 'Legal & Policies',
      'tours': 'Tour Packages',
      'activities': 'Activities',
      'hotels': 'Hotels',
      'transport': 'Transport Services',
      'blog': 'Blog',
      'houseboats': 'Houseboats'
       
    };

    function getCategoryTitle(cat) {
      // If custom name exists, use it
      if (categoryNames[cat]) return categoryNames[cat];
      // Otherwise capitalize category name
      return cat.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    function createLink(page) {
      const isActive = currentPath === page.url ? ' class="active"' : '';
      return `<a href="${page.url}"${isActive}>${page.title}</a>`;
    }

    // Build footer sections dynamically
    let footerSections = '';
    
    // Always show main/quick links first
    if (categories.main && categories.main.length > 0) {
      const links = categories.main.slice(0, CONFIG.MAX_CATEGORY_LINKS);
      footerSections += `
        <div class="footer-col">
          <h3 class="footer-heading">Quick Links</h3>
          <nav class="footer-links">
            ${links.map(createLink).join('')}
          </nav>
        </div>
      `;
    }

    // Show other categories (exclude main and legal)
  Object.keys(categories)
  .filter(cat => cat !== 'main' && cat !== 'legal' && categories[cat].length > 0)
  .slice(0, 20) // Max 3 additional sections
  .forEach(cat => {
        const links = categories[cat].slice(0, CONFIG.MAX_CATEGORY_LINKS);
        footerSections += `
          <div class="footer-col">
            <h3 class="footer-heading">${getCategoryTitle(cat)}</h3>
            <nav class="footer-links">
              ${links.map(createLink).join('')}
            </nav>
          </div>
        `;
      });

    // Always show legal section last
    if (categories.legal && categories.legal.length > 0) {
      footerSections += `
        <div class="footer-col">
          <h3 class="footer-heading">Legal & More</h3>
          <nav class="footer-links">
            ${categories.legal.map(createLink).join('')}
            <a href="all-pages.html"><strong>📄 View All Pages</strong></a>
          </nav>
        </div>
      `;
    }

    const footerHTML = `
    <footer class="site-footer">
      <div class="footer-container">
        
        <!-- Company Info -->
        <div class="footer-col footer-about">
          <div class="footer-logo">
            <div class="footer-logo-icon">O</div>
            <div class="footer-logo-text">
              <span class="footer-logo-name">Olympias Athena</span>
              <span class="footer-logo-sub">Dal Lake · Srinagar · Kashmir</span>
            </div>
          </div>
          <p class="footer-desc">
            Experience luxury houseboat living on Dal Lake, Srinagar. 
            Authentic Kashmiri hospitality since generations. 
            15+ premium rooms with stunning lake views.
          </p>
          <div class="footer-contact">
            <p><strong>📍</strong> ${SITE_INFO.address}</p>
            <p><strong>📞</strong> <a href="tel:${SITE_INFO.phone}">${SITE_INFO.phone}</a></p>
            <p><strong>✉️</strong> <a href="mailto:${SITE_INFO.email}">${SITE_INFO.email}</a></p>
          </div>
        </div>

        ${footerSections}

      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${SITE_INFO.name}. All rights reserved.</p>
        <p class="footer-tagline">Crafted with ❤️ in the heart of Kashmir</p>
      </div>
    </footer>
    `;

    return footerHTML;
  }

  // ===== BUILD SCHEMA MARKUP =====
  function buildSchemaMarkup(pages) {
    if (!CONFIG.ENABLE_SCHEMA) return '';

    const schemaLinks = pages
      .filter(p => p.category === 'main' || p.priority >= 0.7)
      .slice(0, 10)
      .map((page, index) => ({
        '@type': 'SiteNavigationElement',
        'position': index + 1,
        'name': page.title,
        'url': `https://${SITE_INFO.domain}/${page.url}`
      }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Site Navigation',
      'description': 'Main navigation links for Olympias Athena Group of Houseboats',
      'itemListElement': schemaLinks
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    return script;
  }

  // ===== INJECT FOOTER =====
  async function injectFooter() {
    // Check if footer already exists
    if (document.querySelector('.site-footer')) return;

    try {
      const pages = await fetchPages();
      const categories = categorizePages(pages);
      const footerHTML = buildFooterHTML(categories);

      // Inject footer before closing body tag
      const footerDiv = document.createElement('div');
      footerDiv.innerHTML = footerHTML;
      document.body.appendChild(footerDiv.firstElementChild);

      // Add schema markup
      if (CONFIG.ENABLE_SCHEMA) {
        const schema = buildSchemaMarkup(pages);
        document.head.appendChild(schema);
      }

      // Add footer styles dynamically if not loaded
      injectFooterStyles();

    } catch (e) {
      console.error('Failed to inject footer:', e);
    }
  }

  // ===== INJECT FOOTER STYLES =====
  function injectFooterStyles() {
    // Check if styles already exist
    if (document.getElementById('partial-footer-styles')) return;

    const styles = `
    <style id="partial-footer-styles">
      /* ===== FOOTER STYLES ===== */
      .site-footer {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        color: #e0e0e0;
        padding: 60px 20px 20px;
        margin-top: 80px;
        border-top: 3px solid #c9a961;
      }
      .footer-container {
        max-width: 1400px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;
        margin-bottom: 40px;
      }
      .footer-col {
        min-width: 0;
      }
      .footer-about {
        grid-column: span 1;
      }
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .footer-logo-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #c9a961, #d4b574);
        color: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
        border-radius: 8px;
        font-family: 'Playfair Display', serif;
      }
      .footer-logo-text {
        display: flex;
        flex-direction: column;
      }
      .footer-logo-name {
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        font-family: 'Playfair Display', serif;
      }
      .footer-logo-sub {
        font-size: 12px;
        color: #c9a961;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .footer-desc {
        color: #b0b0b0;
        line-height: 1.7;
        margin-bottom: 20px;
        font-size: 15px;
      }
      .footer-contact {
        margin-top: 20px;
      }
      .footer-contact p {
        margin: 8px 0;
        font-size: 14px;
        color: #d0d0d0;
      }
      .footer-contact a {
        color: #c9a961;
        text-decoration: none;
        transition: color 0.3s;
      }
      .footer-contact a:hover {
        color: #d4b574;
      }
      .footer-heading {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #fff;
        font-family: 'Playfair Display', serif;
        border-bottom: 2px solid #c9a961;
        display: inline-block;
        padding-bottom: 8px;
      }
      .footer-links {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .footer-links a {
        color: #b0b0b0;
        text-decoration: none;
        font-size: 15px;
        transition: all 0.3s;
        padding-left: 0;
        position: relative;
      }
      .footer-links a:hover {
        color: #c9a961;
        padding-left: 8px;
      }
      .footer-links a.active {
        color: #c9a961;
        font-weight: 500;
      }
      .footer-links a strong {
        color: #fff;
      }
      .footer-bottom {
        text-align: center;
        padding-top: 30px;
        border-top: 1px solid #404040;
        color: #888;
        font-size: 14px;
      }
      .footer-bottom p {
        margin: 5px 0;
      }
      .footer-tagline {
        color: #c9a961;
        font-style: italic;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .site-footer {
          padding: 40px 15px 15px;
          margin-top: 60px;
        }
        .footer-container {
          grid-template-columns: 1fr;
          gap: 30px;
        }
        .footer-about {
          grid-column: span 1;
        }
      }
    </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // ===== INITIALIZE =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }

})();
