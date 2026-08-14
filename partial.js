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
    MAX_CATEGORY_LINKS: 20,
    ENABLE_SCHEMA: true,
    ENABLE_TOP_CTA: true,
    ENABLE_FLOATING_BUTTONS: true
  };

  const SITE_INFO = {
    name: 'Olympias Athena Group of Houseboats',
    domain: 'olympiasathena.com',
    phone: '+919596431735',
    email: 'guroosaif6@gmail.com',
    address: 'Dal Lake, Boulevard Road, Ghat No.13, Srinagar, J&K 190001',
    coordinates: { lat: '34.0837', lng: '74.8262' },
    social: [
      { name: 'LinkedIn', url: 'https://in.linkedin.com/in/olympias-athena-b3912b419' },
      { name: 'Facebook', url: 'https://www.facebook.com/share/1Dks2ZTbma/' },
      { name: 'Instagram', url: 'https://www.instagram.com/olympias_athena' },
      { name: 'YouTube', url: 'https://youtube.com/@olympiasathena' },
      { name: 'Google Reviews', url: 'https://g.page/r/CRbbS6Zn62yHEBM/review' }
    ]
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
  // Mirrors pages-registry.json so a fetch failure still shows the complete footer,
  // not just the original 8 pages. Keep this in sync when adding new pages.
  function getFallbackPages() {
    return [
      { url: 'index.html', title: 'Home', category: 'main', priority: 1.0 },
      { url: 'about.html', title: 'About Us', category: 'main', priority: 0.9 },
      { url: 'rooms.html', title: 'Rooms', category: 'main', priority: 0.9 },
      { url: 'gallery.html', title: 'Gallery', category: 'main', priority: 0.8 },
      { url: 'contact.html', title: 'Contact', category: 'main', priority: 0.8 },
      { url: 'services.html', title: 'Services', category: 'services', priority: 0.9 },
      { url: 'athena-houseboat.html', title: 'Athena Houseboat', category: 'services', priority: 0.9 },
      { url: 'olympias-houseboat.html', title: 'Olympias Houseboat', category: 'services', priority: 0.9 },
      { url: 'houseboats-in-kashmir.html', title: 'Houseboats in Kashmir', category: 'destinations', priority: 0.75 },
      { url: 'best-houseboats-jammu-kashmir.html', title: 'Best Houseboats in Jammu & Kashmir', category: 'destinations', priority: 0.75 },
      { url: 'best-houseboats-near-dal-lake.html', title: 'Best Houseboats Near Dal Lake', category: 'destinations', priority: 0.7 },
      { url: 'about-dal-lake.html', title: 'About Dal Lake', category: 'destinations', priority: 0.75 },
      { url: 'how-dal-lake-houseboats-are-made.html', title: 'How Houseboats Are Made', category: 'destinations', priority: 0.7 },
      { url: 'sonamarg.html', title: 'Sonamarg Travel Guide', category: 'destinations', priority: 0.7 },
      { url: 'olympias-athena-houseboats-guide.html', title: 'Olympias Athena Houseboats Guide', category: 'destinations', priority: 0.75 },
      { url: 'best-time-to-visit-kashmir.html', title: 'Best Time to Visit Kashmir', category: 'destinations', priority: 0.7 },
      { url: 'houseboat-vs-hotel-srinagar.html', title: 'Houseboat vs Hotel in Srinagar', category: 'destinations', priority: 0.7 },
      { url: 'kashmir-houseboat-cost.html', title: 'Kashmir Houseboat Cost Breakdown', category: 'destinations', priority: 0.7 },
      { url: '7-day-kashmir-itinerary.html', title: '7-Day Kashmir Itinerary', category: 'destinations', priority: 0.75 },
      { url: 'is-kashmir-safe-to-visit.html', title: 'Is Kashmir Safe to Visit?', category: 'destinations', priority: 0.75 },
      { url: 'kashmiri-wazwan-guide.html', title: 'Kashmiri Wazwan Guide', category: 'destinations', priority: 0.7 },
      { url: 'how-to-reach-srinagar.html', title: 'How to Reach Srinagar', category: 'destinations', priority: 0.7 },
      { url: 'dal-lake-sunrise-photography.html', title: 'Dal Lake Sunrise Photography', category: 'destinations', priority: 0.65 },
      { url: 'terms.html', title: 'Terms & Conditions', category: 'legal', priority: 0.3 },
      { url: 'privacy.html', title: 'Privacy Policy', category: 'legal', priority: 0.3 }
    ];
  }

  // ===== CATEGORIZE PAGES =====
  function categorizePages(pages) {
    const categories = {
      main: [],
      destinations: [],
      services: [],
      business: [],
      latest: [],
      legal: []
    };

    pages.forEach(page => {
      const cat = page.category || 'main';
      if (categories[cat]) {
        categories[cat].push(page);
      }
    });

    // Sort by priority
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
    });

    // Get latest pages (sort by lastModified if available)
    categories.latest = [...pages]
      .filter(p => p.lastModified)
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5);

    return categories;
  }

  // ===== BUILD FOOTER HTML =====
  function buildFooterHTML(categories) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const mainLinks = categories.main.slice(0, CONFIG.MAX_CATEGORY_LINKS);
    const destinationLinks = categories.destinations.slice(0, CONFIG.MAX_CATEGORY_LINKS);
    const serviceLinks = categories.services.slice(0, CONFIG.MAX_CATEGORY_LINKS);
    const latestLinks = categories.latest.slice(0, 5);
    const legalLinks = categories.legal;

    function createLink(page) {
      const isActive = currentPath === page.url ? ' class="active"' : '';
      return `<a href="${page.url}"${isActive}>${page.title}</a>`;
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

        <!-- Quick Links -->
        <div class="footer-col">
          <h3 class="footer-heading">Quick Links</h3>
          <nav class="footer-links">
            ${mainLinks.map(createLink).join('')}
          </nav>
        </div>

        <!-- Follow Us -->
        <div class="footer-col">
          <h3 class="footer-heading">Follow Us</h3>
          <nav class="footer-links">
            ${SITE_INFO.social.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join('')}
          </nav>
        </div>

        <!-- Destinations (if available) -->
        ${destinationLinks.length > 0 ? `
        <div class="footer-col">
          <h3 class="footer-heading">Destinations</h3>
          <nav class="footer-links">
            ${destinationLinks.map(createLink).join('')}
          </nav>
        </div>
        ` : ''}

        <!-- Services (if available) -->
        ${serviceLinks.length > 0 ? `
        <div class="footer-col">
          <h3 class="footer-heading">Our Services</h3>
          <nav class="footer-links">
            ${serviceLinks.map(createLink).join('')}
          </nav>
        </div>
        ` : ''}

        <!-- Business Pages (if available) -->
        ${categories.business && categories.business.length > 0 ? `
        <div class="footer-col">
          <h3 class="footer-heading">Business</h3>
          <nav class="footer-links">
            ${categories.business.slice(0, CONFIG.MAX_CATEGORY_LINKS).map(createLink).join('')}
          </nav>
        </div>
        ` : ''}

        <!-- Latest Pages (if available) -->
        ${latestLinks.length > 0 ? `
        <div class="footer-col">
          <h3 class="footer-heading">Recently Added</h3>
          <nav class="footer-links">
            ${latestLinks.map(createLink).join('')}
          </nav>
        </div>
        ` : ''}

        <!-- Legal & All Pages -->
        <div class="footer-col">
          <h3 class="footer-heading">Legal & More</h3>
          <nav class="footer-links">
            ${legalLinks.map(createLink).join('')}
            <a href="all-pages.html"><strong>📄 View All Pages</strong></a>
          </nav>
        </div>

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
    if (!CONFIG.ENABLE_SCHEMA) return [];

    const schemaLinks = pages
      .filter(p => p.category === 'main' || p.priority >= 0.7)
      .slice(0, 10)
      .map((page, index) => ({
        '@type': 'SiteNavigationElement',
        'position': index + 1,
        'name': page.title,
        'url': `https://${SITE_INFO.domain}/${page.url}`
      }));

    const navSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Site Navigation',
      'description': 'Main navigation links for Olympias Athena Group of Houseboats',
      'itemListElement': schemaLinks
    };

    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': SITE_INFO.name,
      'url': `https://${SITE_INFO.domain}`,
      'sameAs': SITE_INFO.social.map(s => s.url)
    };

    const scripts = [navSchema, orgSchema].map(obj => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(obj);
      return script;
    });

    return scripts;
  }

  // ===== INJECT TOP CTA BAR =====
  function injectTopCTA() {
    if (!CONFIG.ENABLE_TOP_CTA) return;
    // Guard: skip if a top CTA bar already exists on the page (static or previously injected)
    if (document.querySelector('.top-cta-bar')) return;

    const waMsg = encodeURIComponent("Hi, I'd like to know more about staying at Olympias Athena on Dal Lake.");
    const bar = document.createElement('div');
    bar.className = 'top-cta-bar';
    bar.innerHTML = `
      <div class="top-cta-inner">
        <span class="top-cta-text">👑 Olympias Athena — Dal Lake, Srinagar</span>
        <div class="top-cta-actions">
          <a href="tel:${SITE_INFO.phone}" class="top-cta-btn top-cta-call">📞 Call</a>
          <a href="https://wa.me/${SITE_INFO.phone.replace('+','')}?text=${waMsg}" target="_blank" rel="noopener" class="top-cta-btn top-cta-whatsapp">💬 WhatsApp</a>
          <a href="https://wa.me/${SITE_INFO.phone.replace('+','')}?text=${waMsg}" target="_blank" rel="noopener" class="top-cta-btn top-cta-book">Book Now →</a>
        </div>
      </div>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ===== INJECT FLOATING CALL / WHATSAPP BUTTONS =====
  function injectFloatingButtons() {
    if (!CONFIG.ENABLE_FLOATING_BUTTONS) return;
    // Guard: skip if floating buttons already exist, OR if the page has its own
    // legacy floating WhatsApp widget (#wa-float, found on original site pages
    // like contact.html) — avoids stacking a second floating button on top.
    if (document.querySelector('.floating-contact-buttons') || document.querySelector('#wa-float')) return;

    const waMsg = encodeURIComponent("Hi, I'd like to know more about staying at Olympias Athena on Dal Lake.");
    const wrap = document.createElement('div');
    wrap.className = 'floating-contact-buttons';
    wrap.innerHTML = `
      <a href="https://wa.me/${SITE_INFO.phone.replace('+','')}?text=${waMsg}" target="_blank" rel="noopener" class="floating-btn floating-whatsapp" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.36.66 4.56 1.8 6.44L4 29l7.72-1.76a11.9 11.9 0 0 0 4.3.8h.01C22.63 28.04 28 22.64 28 15.02 28 8.4 22.63 3 16.02 3zm0 21.6h-.01a9.6 9.6 0 0 1-4.9-1.35l-.35-.21-3.63.83.86-3.6-.23-.37a9.55 9.55 0 0 1-1.47-5.08c0-5.3 4.32-9.62 9.63-9.62 2.57 0 4.99 1 6.8 2.82a9.55 9.55 0 0 1 2.82 6.8c0 5.3-4.32 9.78-9.52 9.78zm5.28-7.19c-.29-.14-1.71-.84-1.98-.94-.27-.1-.46-.14-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.44-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.5-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-1 1-1 2.42s1.02 2.8 1.17 3c.14.19 2.01 3.08 4.87 4.31.68.29 1.21.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z"/></svg>
      </a>
      <a href="tel:${SITE_INFO.phone}" class="floating-btn floating-call" aria-label="Call now" title="Call now">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z"/></svg>
      </a>
    `;
    document.body.appendChild(wrap);
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
        const schemas = buildSchemaMarkup(pages);
        schemas.forEach(s => document.head.appendChild(s));
      }

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

      /* ===== TOP CTA BAR ===== */
      .top-cta-bar {
        position: sticky;
        top: 0;
        z-index: 1001;
        background: linear-gradient(135deg, #c9a961 0%, #b8955a 100%);
        padding: 0.65rem 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Jost', Arial, sans-serif;
      }
      .top-cta-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .top-cta-text {
        font-weight: 700;
        color: #2d2416;
        font-size: 1rem;
      }
      .top-cta-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .top-cta-btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.88rem;
        white-space: nowrap;
      }
      .top-cta-call { background: #2d2416; color: #c9a961; }
      .top-cta-whatsapp { background: #25d366; color: #fff; }
      .top-cta-book { background: #fff; color: #2d2416; }
      @media (max-width: 600px) {
        .top-cta-text { font-size: 0.85rem; width: 100%; text-align: center; }
        .top-cta-inner { justify-content: center; }
        .top-cta-btn { padding: 0.45rem 0.8rem; font-size: 0.8rem; }
      }

      /* ===== FLOATING CONTACT BUTTONS ===== */
      .floating-contact-buttons {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .floating-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        text-decoration: none;
        color: #fff;
        transition: transform 0.2s ease;
      }
      .floating-btn:hover { transform: scale(1.08); }
      .floating-whatsapp { background: #25d366; }
      .floating-call {
        background: linear-gradient(135deg, #c9a961, #b8955a);
        animation: floatingPulse 2.4s ease-in-out infinite;
      }
      @keyframes floatingPulse {
        0%, 100% { box-shadow: 0 4px 16px rgba(201,169,97,0.35); }
        50% { box-shadow: 0 4px 22px rgba(201,169,97,0.7); }
      }
      @media (max-width: 600px) {
        .floating-contact-buttons { right: 14px; bottom: 14px; gap: 10px; }
        .floating-btn { width: 48px; height: 48px; }
        .floating-btn svg { width: 22px; height: 22px; }
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
  function initAll() {
    injectFooterStyles();     // always load CSS first — needed by CTA bar + floating buttons too
    injectTopCTA();
    injectFloatingButtons();
    injectFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
