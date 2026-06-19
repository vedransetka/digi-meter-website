/**
 * DIGI-METER Web Application Logic
 * Interactive handlers for accessibility, filtering, sliders, forms,
 * and the consortium detail drawers.
 */

/**
 * Global toast utility — defined before DOMContentLoaded so inline
 * onclick handlers can call it immediately on user interaction.
 */
const showToast = (message, type = 'success', duration = 5000) => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular elements
  initNavigation();
  initAccessibility();
  initPartnerDrawer();
  initResourceFilters();
  initEventTabs();
  initFormHandlers();
  initLanguageSelector();
});

/* ==========================================================================
   Language selector — project languages
   Sets the document language and gives honest feedback. Full translated
   content is being prepared (see translation roadmap); English is live.
   ========================================================================== */
function initLanguageSelector() {
  const sel = document.getElementById('lang-select');
  if (!sel) return;
  const names = { en: 'English', el: 'Ελληνικά (Greek)', de: 'Deutsch (German)', fr: 'Français (French)', it: 'Italiano (Italian)', pt: 'Português (Portuguese)', nl: 'Nederlands (Dutch)' };
  sel.addEventListener('change', () => {
    const code = sel.value;
    document.documentElement.lang = code;               // reflect chosen language
    if (code !== 'en') {
      showToast(`The ${names[code] || code} version is being prepared — translation in progress.`, 'info', 5000);
    }
  });
}

/* ==========================================================================
   1. Responsive Navigation & Scroll Handlers
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const burgerMenu = document.querySelector('.burger-menu');
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll active state for header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightNavOnScroll();
  });

  // Mobile menu toggle
  function closeMobileNav() {
    burgerMenu.classList.remove('active');
    mobileNavPanel.classList.remove('active');
    document.body.style.overflow = '';
    burgerMenu.setAttribute('aria-expanded', 'false');
    burgerMenu.focus(); // Return focus to trigger on close — WCAG 2.4.3
  }

  if (burgerMenu && mobileNavPanel) {
    burgerMenu.addEventListener('click', () => {
      const active = burgerMenu.classList.toggle('active');
      mobileNavPanel.classList.toggle('active');
      document.body.style.overflow = active ? 'hidden' : '';
      burgerMenu.setAttribute('aria-expanded', active ? 'true' : 'false'); // WCAG 4.1.2
      if (active) {
        // Move focus into panel so keyboard users can navigate — WCAG 2.4.3
        const firstFocusable = mobileNavPanel.querySelector('a, button');
        if (firstFocusable) firstFocusable.focus();
      }
    });

    // Close on Escape key — WCAG 2.1.2
    mobileNavPanel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  // Close mobile menu on links click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileNav());
  });

  // Close button inside the panel
  const mobileNavClose = document.getElementById('mobile-nav-close');
  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => closeMobileNav());
  }

  // Smooth scroll and active class assignment
  function highlightNavOnScroll() {
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120; // offset header
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   2. Accessibility Controllers
   ========================================================================== */
function initAccessibility() {
  const contrastBtn = document.getElementById('contrast-toggle');
  const sizeDecreaseBtn = document.getElementById('size-decrease');
  const sizeIncreaseBtn = document.getElementById('size-increase');
  const htmlEl = document.documentElement;

  // 2.1 Contrast Toggle (Stored in LocalStorage)
  if (localStorage.getItem('high-contrast') === 'true') {
    htmlEl.classList.add('high-contrast');
    if (contrastBtn) contrastBtn.textContent = 'Normal Contrast';
  }

  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      const active = htmlEl.classList.toggle('high-contrast');
      localStorage.setItem('high-contrast', active);
      contrastBtn.textContent = active ? 'Normal Contrast' : 'High Contrast';
      contrastBtn.setAttribute('aria-pressed', active);
    });
  }

  // 2.2 Fluid Font Size Scale Control
  let fontScale = parseInt(localStorage.getItem('font-scale') || '0');
  applyFontScale(fontScale);

  if (sizeIncreaseBtn) {
    sizeIncreaseBtn.addEventListener('click', () => {
      if (fontScale < 2) {
        fontScale++;
        localStorage.setItem('font-scale', fontScale);
        applyFontScale(fontScale);
      }
    });
  }

  if (sizeDecreaseBtn) {
    sizeDecreaseBtn.addEventListener('click', () => {
      if (fontScale > 0) {
        fontScale--;
        localStorage.setItem('font-scale', fontScale);
        applyFontScale(fontScale);
      }
    });
  }

  function applyFontScale(scale) {
    htmlEl.classList.remove('font-large', 'font-xlarge');
    if (scale === 1) htmlEl.classList.add('font-large');
    if (scale === 2) htmlEl.classList.add('font-xlarge');
  }
}

/* ==========================================================================
   3. Consortium Partner Drawer Module
   ========================================================================== */
const partnerData = {
  csi: {
    name: "Center for Social Innovation (CSI)",
    country: "Cyprus | Coordinator",
    role: "Project coordination, quality assurance, reporting, sustainability support, and overall consortium coordination.",
    desc: "Center for Social Innovation (CSI) is a Cyprus-based research and innovation organisation dedicated to social impact through education, technology, and collaboration. The organisation develops and implements European and international projects focused on digital transformation, social inclusion, sustainability, entrepreneurship, and lifelong learning, creating innovative solutions that empower communities and support inclusive growth.",
    logo: "/assets/logos/csi.png",
    url: "https://csicy.com/"
  },
  scico: {
    name: "SciCo",
    country: "Greece | Education and framework development",
    role: "Framework mapping, DigComp 2.2 indicator development, educational methodology, and teacher engagement.",
    desc: "SciCo (Science Communication) is a non-profit organisation focused on scientific engagement and empowerment through innovative, interactive, and entertaining means. Founded in 2008, it brings together scientists, academics, educators, artists, and science enthusiasts. Today it operates as a social enterprise and has reached more than 400,000 people across Greece through science festivals, digital platforms, and workshops.",
    logo: "/assets/logos/scico.png",
    url: "https://scico.gr/en/"
  },
  ubitech: {
    name: "UBITECH",
    country: "Greece | Technology development",
    role: "Technical development of the platform, adaptive assessment engine, APIs, dashboard, and secure cloud integration.",
    desc: "UBITECH is a leading, innovative, and research-driven software house, systems integrator, and technology provider established in Athens in 2005. It delivers advanced technical solutions to businesses, organisations, and governments — with strong expertise in AI, data analytics, cybersecurity, and digital transformation. UBITECH actively participates in European research and innovation initiatives and operates internationally across Europe and South America.",
    logo: "/assets/logos/ubitech.png",
    url: "https://ubitech.eu/"
  },
  approximar: {
    name: "Approximar",
    country: "Portugal | Piloting and validation",
    role: "Piloting, VET engagement, validation activities, user feedback, and evidence from learning contexts.",
    desc: "Approximar brings strong experience in vocational education, social innovation, and stakeholder engagement. In DIGI-METER, the organisation supports pilot preparation, implementation, user feedback collection, and validation activities in real educational and VET settings. Its contribution helps ensure that the project tools are practical, inclusive, and relevant for institutions and learners.",
    logo: "/assets/logos/aproximar.png",
    url: "" // URL to be confirmed with partner
  },
  lasco: {
    name: "Lascò",
    country: "Italy | Policy transfer and sustainability",
    role: "Policy transfer, dissemination support, sustainability planning, and stakeholder communication.",
    desc: "Lascò is an innovative SME established in 2013, specialising in digital transformation. The organisation supports public and private stakeholders in designing and implementing human-centred innovation processes. Its activities combine innovation design, advanced digital solutions, and applied educational research — addressing the needs of education providers, companies, institutions, and sectoral ecosystems at national and international level.",
    logo: "/assets/logos/lasco.svg",
    url: "https://en.lasco.io/"
  },
  omk: {
    name: "Outside Media & Knowledge",
    country: "Germany | Co-leaders of WP5 Communication, Dissemination & Exploitation",
    role: "Co-leaders of WP5 — responsible for project branding, website development and operation, social media, press kit, and dissemination strategy.",
    desc: "Outside Media & Knowledge is a German creative agency specialising in digital communication for European-funded projects. As co-leaders of WP5, the organisation leads project branding, website development and operation, social media, press relations, and the full dissemination and exploitation strategy for DIGI-METER. This website is designed, hosted, and maintained by Outside Media & Knowledge.",
    logo: "/assets/logos/outside-media.png",
    url: "https://outsidemedia.eu/"
  },
  syncnify: {
    name: "Syncnify",
    country: "France | Analytics and user experience",
    role: "Analytics, dashboard interfaces, front-end support, user experience, and data visualisation.",
    desc: "Syncnify is a Paris-based social innovation and consulting agency supporting organisations in turning sustainability, inclusivity, and innovation into practical action. Working with businesses, public institutions, research bodies, and civil society, it designs tailored strategies, builds partnerships, and promotes sustainable growth. Syncnify is a member of the Pact for Skills and the European Digital SMEs Alliance.",
    logo: "/assets/logos/syncnify.png",
    url: "https://www.syncnify.fr"
  },
  cec: {
    name: "CEC (Chrysako Educational Centre Limited)",
    country: "Cyprus | VET engagement and dissemination support",
    role: "VET sector input, stakeholder engagement, dissemination activities, event support, and WP5 communication coordination.",
    desc: "CEC (Chrysako Educational Centre Limited) operates the College of Tourism and Hotel Management (COTHM), a private higher education institution in Cyprus specialising in tourism, hospitality, business, management, and vocational education and training. COTHM also hosts a research department active in European projects focused on tourism sustainability, circular economy, immersive technologies, serious games, gamification, and digital education.",
    logo: "/assets/logos/cec.gif",
    url: "https://www.cothm.ac.cy/"
  },
  abcorp: {
    name: "AB Corporation",
    country: "Belgium | EU policy and standardisation",
    role: "EU policy liaison, credential and standardisation expertise, DigComp/EDSC alignment, and policy engagement.",
    desc: "AB Corporation specialises in guiding organisations through the full journey of EU proposal writing and project management. With a mission to transform innovative ideas into funded, high-impact projects, it supports clients from early concept development to successful submission and implementation — spanning proposal writing, funding scheme selection, project management, and strategic partnership building.",
    logo: "/assets/logos/abcorporation.png",
    url: "https://ab-corporation.com/"
  },
  ergonact: {
    name: "Ergonact",
    country: "Cyprus | Ethics, AI and accessibility",
    role: "Ethics, accessibility, AI compliance, GDPR support, bias audits, and responsible technology guidance.",
    desc: "Ergonact is a Cyprus-based consultancy specialising in AI transformation, data governance, and EU-funded research and innovation. It delivers data and AI readiness assessments, cybersecurity advisory, and automation services for SMEs and public sector clients, while leading ethics and data governance workstreams across Horizon Europe, Erasmus+, and Digital Europe Programme projects.",
    logo: "/assets/logos/ergonact.png",
    url: "https://www.ergonact.com"
  },
  crow: {
    name: "Crow Group",
    country: "Netherlands | Stakeholder engagement and exploitation support",
    role: "Stakeholder engagement, policy alignment, exploitation support, and applied research contribution.",
    desc: "Crow Group contributes experience in applied research, sustainable development, public-sector innovation, and stakeholder engagement. In DIGI-METER, it supports policy alignment, exploitation planning, and outreach to relevant networks. Its contribution helps strengthen the long-term relevance and practical uptake of the project results.",
    logo: "/assets/logos/crowgroup.svg",
    url: "" // URL to be confirmed with partner
  }
};

function initPartnerDrawer() {
  const partnerCards = document.querySelectorAll('.partner-card[data-partner]');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close-btn');

  // Elements to populate in the drawer
  const logoImg = document.getElementById('drawer-logo');
  const logoPlaceholder = document.getElementById('drawer-logo-placeholder');
  const title = document.getElementById('drawer-title');
  const country = document.getElementById('drawer-country');
  const roleText = document.getElementById('drawer-role-text');
  const descText = document.getElementById('drawer-desc-text');
  const webLink = document.getElementById('drawer-web-link');

  if (!backdrop) return;

  // Open drawer handler
  partnerCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-partner');
      const data = partnerData[id];

      if (data) {
        // Populate content
        title.textContent = data.name;
        country.textContent = data.country;
        roleText.textContent = data.role;
        descText.textContent = data.desc;
        webLink.setAttribute('href', data.url);
        webLink.innerHTML = `Visit Official Website <span class="mono" style="font-size: 0.6rem; margin-left: 6px;">↗</span>`;

        if (logoPlaceholder) logoPlaceholder.style.display = 'none';
        logoImg.style.display = 'block';
        logoImg.setAttribute('src', data.logo);
        logoImg.setAttribute('alt', `${data.name} Logo`);

        // Show website button only when a confirmed URL exists
        if (data.url) {
          webLink.style.display = '';
        } else {
          webLink.style.display = 'none';
        }

        // Open Drawer — expose to assistive tech and move focus (WCAG 4.1.2 / 2.4.3)
        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lastFocused = card;
        if (closeBtn) closeBtn.focus();
      }
    });
  });

  // Close drawer handlers
  let lastFocused = null;
  const closeDrawer = () => {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus(); // return focus to trigger — WCAG 2.4.3
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeDrawer();
  });
  
  // Close drawer on ESC key + keep focus inside while open (focus trap)
  window.addEventListener('keydown', (e) => {
    if (!backdrop.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = backdrop.querySelectorAll('button, a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ==========================================================================
   4. Outputs & Resources Category Filters
   ========================================================================== */
function initResourceFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const resourceCards = document.querySelectorAll('.resource-card[data-category]');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active classes + toggle state for assistive tech
      filterButtons.forEach(b => {
        b.classList.remove('active');
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'true');

      const filterVal = btn.getAttribute('data-filter');

      // Filter grid elements
      resourceCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.25s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. Events Tabs Switcher
   ========================================================================== */
function initEventTabs() {
  const tabButtons = document.querySelectorAll('.event-tab-btn');
  const panes = document.querySelectorAll('.event-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetPaneId = btn.getAttribute('data-tab');

      // Toggle panes
      panes.forEach(pane => {
        if (pane.getAttribute('id') === targetPaneId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   6. Accessible Interactive Form Signups (Simulated backend)
   ========================================================================== */
/* ==========================================================================
   Form delivery helpers — POST to the PHP mailer (send.php)
   Shared by main.js handlers and the inline handlers on contact/platform pages.
   ========================================================================== */

// Captured at page load; used as a simple bot time-trap on the server.
const DIGI_FORM_TS = Math.floor(Date.now() / 1000);

// Inject an off-screen honeypot field into each real form (not the search box).
function digiAddHoneypots() {
  document.querySelectorAll('form').forEach((form) => {
    if (form.classList.contains('search-box')) return;
    if (form.querySelector('.hp-website')) return;
    const hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.className = 'hp-website';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
    form.appendChild(hp);
  });
}

// POST a payload object to send.php and return { ok, message }.
async function digiPostForm(form, payload) {
  const body = new URLSearchParams(payload);
  body.set('form_ts', String(DIGI_FORM_TS));
  body.set('website', (form && form.querySelector('.hp-website')) ? form.querySelector('.hp-website').value : '');
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    return await res.json();
  } catch (err) {
    return { ok: false, message: 'Could not reach the mail service. Please email digimeter@csicy.com directly.' };
  }
}
window.digiPostForm = digiPostForm;

function initFormHandlers() {
  digiAddHoneypots();
  const newsletterForm = document.getElementById('newsletter-sub-form');
  const contactForm = document.getElementById('main-contact-form');
  const earlyAccessForm = document.getElementById('early-access-form');

  // Helper to show inline feedback — WCAG 4.1.3: role="alert" announces to AT
  const showFeedback = (form, message, type = 'success') => {
    // Remove previous alerts
    const prevAlert = form.querySelector('.form-feedback-alert');
    if (prevAlert) prevAlert.remove();

    const alert = document.createElement('div');
    alert.className = `form-feedback-alert mono`;
    alert.setAttribute('role', 'alert');       // Announced immediately by screen readers
    alert.setAttribute('aria-live', 'assertive');
    alert.style.padding = '12px 16px';
    alert.style.marginTop = '14px';
    alert.style.fontSize = '0.78rem';
    alert.style.fontWeight = '600';
    alert.style.borderLeft = '3px solid';

    if (type === 'success') {
      alert.style.backgroundColor = 'rgba(83, 200, 234, 0.08)';
      alert.style.color = '#1a7fa0'; // Darker for contrast on light bg
      alert.style.borderColor = '#53C8EA';
      alert.textContent = '✓ ' + message; // Text prefix — WCAG 1.4.1: not colour-only
    } else {
      alert.style.backgroundColor = 'rgba(200, 60, 30, 0.07)';
      alert.style.color = '#c03c1e'; // Darker red for contrast
      alert.style.borderColor = '#c03c1e';
      alert.textContent = '⚠ Error: ' + message; // Text prefix — WCAG 1.4.1
    }

    form.appendChild(alert);

    // Fade out after 6 seconds
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 6000);
  };

  // Disable a submit button while a request is in flight, then restore it.
  const withSubmitting = async (form, fn) => {
    const btn = form.querySelector('button[type="submit"], button:not([type])');
    const label = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try { await fn(); }
    finally { if (btn) { btn.disabled = false; btn.textContent = label; } }
  };

  // 6.1 Platform early-access form
  if (earlyAccessForm) {
    earlyAccessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = earlyAccessForm.querySelector('input[type="email"]');
      if (!emailInput || !emailInput.value) return;
      withSubmitting(earlyAccessForm, async () => {
        const res = await digiPostForm(earlyAccessForm, { form_type: 'Platform Access', email: emailInput.value });
        showFeedback(earlyAccessForm, res.message, res.ok ? 'success' : 'error');
        if (res.ok) earlyAccessForm.reset();
      });
    });
  }

  // 6.2 Newsletter subscription form
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const consentCheck = newsletterForm.querySelector('input[type="checkbox"]');
      if (!emailInput || !emailInput.value) return;
      if (consentCheck && !consentCheck.checked) {
        showFeedback(newsletterForm, 'Please accept the privacy policy consent to proceed.', 'error');
        return;
      }
      withSubmitting(newsletterForm, async () => {
        const res = await digiPostForm(newsletterForm, { form_type: 'Newsletter', email: emailInput.value });
        showFeedback(newsletterForm, res.message, res.ok ? 'success' : 'error');
        if (res.ok) { newsletterForm.reset(); if (consentCheck) consentCheck.checked = false; }
      });
    });
  }

  // 6.3 Main contact form (homepage)
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const org = document.getElementById('contact-org').value;
      const msg = document.getElementById('contact-msg').value;
      const consent = document.getElementById('contact-consent').checked;

      if (!name || !email || !msg) {
        showFeedback(contactForm, 'Please fill in all required fields.', 'error');
        return;
      }
      if (!consent) {
        showFeedback(contactForm, 'GDPR consent is required to process messages.', 'error');
        return;
      }
      withSubmitting(contactForm, async () => {
        const res = await digiPostForm(contactForm, { form_type: 'Contact', name, email, organisation: org, message: msg });
        showFeedback(contactForm, res.message, res.ok ? 'success' : 'error');
        if (res.ok) contactForm.reset();
      });
    });
  }
}
