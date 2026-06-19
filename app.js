// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Smooth Scrolling (Lenis) & GSAP Integration
  // ==========================================================================
  
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
    smoothWheel: true,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis to requestAnimationFrame
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile nav drawer if open
        closeMobileNav();
        
        lenis.scrollTo(targetElement, {
          offset: -80, // Navbar height offset
          duration: 1.5,
          immediate: false
        });
      }
    });
  });

  // ==========================================================================
  // 2. Navigation Header Controls
  // ==========================================================================

  const header = document.getElementById('main-header');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Highlight nav link based on active section
    updateActiveNavLink();
  });

  // Toggle mobile menu drawer
  mobileNavToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('active');
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  function openMobileNav() {
    navMenu.classList.add('active');
    mobileNavToggle.classList.add('open');
    lenis.stop(); // Stop scroll when drawer open
  }

  function closeMobileNav() {
    navMenu.classList.remove('active');
    mobileNavToggle.classList.remove('open');
    lenis.start(); // Resume scroll
  }

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 200;
    const navLinks = document.querySelectorAll('.nav-link');
    
    document.querySelectorAll('.scroll-section').forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================================================
  // 3. Dynamic Theme Switching on Scroll (Morphing background)
  // ==========================================================================

  const scrollSections = document.querySelectorAll('.scroll-section');
  
  scrollSections.forEach(section => {
    const theme = section.getAttribute('data-theme');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => toggleBodyTheme(theme),
      onEnterBack: () => toggleBodyTheme(theme),
    });
  });

  function toggleBodyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
  }

  // ==========================================================================
  // 4. GSAP Micro-animations & Scroll Reveals
  // ==========================================================================

  // Resolve hero elements for safe execution (removes target warnings)
  const heroHeading = document.getElementById('hero-heading');
  const heroSubheading = document.getElementById('hero-subheading');
  const heroBtns = Array.from(document.querySelectorAll('.hero-actions .btn'));
  const logoNav = document.getElementById('logo-nav');
  const navListItems = Array.from(document.querySelectorAll('.nav-list li'));
  const navCtaBtn = document.getElementById('nav-cta-btn');
  const scrollIndicator = document.getElementById('scroll-indicator');

  // Hero entrance load timeline
  const heroTL = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
  
  if (heroHeading) heroTL.from(heroHeading, { y: 60, opacity: 0, delay: 0.2 });
  if (heroSubheading) heroTL.from(heroSubheading, { y: 30, opacity: 0 }, '-=0.9');
  if (heroBtns.length > 0) heroTL.from(heroBtns, { y: 20, opacity: 0, stagger: 0.15 }, '-=0.8');
  if (logoNav) heroTL.from(logoNav, { opacity: 0, x: -30 }, '-=1');
  if (navListItems.length > 0) heroTL.from(navListItems, { opacity: 0, y: -10, stagger: 0.1 }, '-=0.8');
  if (navCtaBtn) heroTL.from(navCtaBtn, { opacity: 0, scale: 0.9 }, '-=0.6');
  if (scrollIndicator) heroTL.from(scrollIndicator, { opacity: 0, y: 10 }, '-=0.4');

  // Hero background parallax
  const heroBgImg = document.getElementById('hero-bg-img');
  const heroSection = document.getElementById('hero');
  if (heroBgImg && heroSection) {
    gsap.to(heroBgImg, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Reveal left items
  gsap.utils.toArray('.reveal-left').forEach(element => {
    gsap.from(element, {
      x: -60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Reveal right items
  gsap.utils.toArray('.reveal-right').forEach(element => {
    gsap.from(element, {
      x: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Reveal up items
  gsap.utils.toArray('.reveal-up').forEach(element => {
    gsap.from(element, {
      y: 50,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Card grid reveals with stagger
  gsap.utils.toArray('.card-grid').forEach(grid => {
    const cards = Array.from(grid.querySelectorAll('.card-reveal'));
    if (cards.length > 0) {
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });

  // Parallax section images
  gsap.utils.toArray('.parallax-img').forEach(img => {
    gsap.to(img, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: img.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // ==========================================================================
  // 5. Interactive Pizza Spinning Wheel ("Pick Me")
  // ==========================================================================

  const canvas = document.getElementById('pizza-wheel');
  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spin-btn');
  const resultCard = document.getElementById('wheel-result-card');
  const resultTitle = document.getElementById('result-pizza-name');
  const resultPrice = document.getElementById('result-pizza-price');
  const resultDesc = document.getElementById('result-pizza-desc');
  const copyBtn = document.getElementById('copy-coupon-btn');
  const couponText = document.getElementById('coupon-code-text');

  const pizzaOptions = [
    { name: "THE SPICY PAT", price: "Rs. 2,450", desc: "Sourdough crust, spicy salami, nduja, fresh mozzarella, hot honey, and fresh basil." },
    { name: "TRUFFLE MUSHROOM", price: "Rs. 2,750", desc: "White base, wild mushrooms, truffle oil, caramelized onions, fresh mozzarella, and arugula." },
    { name: "CLASSIC MARGHERITA", price: "Rs. 1,950", desc: "San Marzano tomato sauce, fresh mozzarella, extra virgin olive oil, and fresh basil." },
    { name: "QUATTRO FORMAGGI", price: "Rs. 2,600", desc: "Mozzarella, gorgonzola, parmesan, and ricotta with a drizzle of local wild honey." },
    { name: "PEPPERONI CLASSIC", price: "Rs. 2,300", desc: "Double beef pepperoni, San Marzano tomato sauce, fresh mozzarella, and oregano." },
    { name: "SMOKY BBQ CHICKEN", price: "Rs. 2,250", desc: "Wood-fired chicken, house BBQ sauce, caramelized onions, smoked cheese, and cilantro." },
    { name: "ROASTED WINGS", price: "Rs. 1,450", desc: "Wood-fired wings tossed in a spicy house glaze, served with blue cheese dip." },
    { name: "TIRAMISU", price: "Rs. 1,200", desc: "Classic Italian tiramisu with coffee-soaked ladyfingers and mascarpone cream." }
  ];

  const size = canvas.width;
  const radius = size / 2;
  const numSlices = pizzaOptions.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  
  let currentRotation = 0; // Degrees
  let isSpinning = false;

  // Colors based on brand guidelines
  const sliceColors = [
    '#680006', // Deep Red
    '#303030', // Charcoal
    '#f6f3ed', // Warm Cream Low
    '#7f5700', // Golden Amber Secondary
    '#630E0E', // Deep Crimson
    '#ebe8e2', // High Surface
    '#1A1A1A', // Charcoal Darker
    '#febe50'  // Golden Amber Bright
  ];

  const sliceTextColors = [
    '#ffffff', // for deep red
    '#ffffff', // for charcoal
    '#1c1c18', // for warm cream
    '#ffffff', // for golden amber
    '#ffffff', // for deep crimson
    '#1c1c18', // for high surface
    '#ffffff', // for charcoal darker
    '#724d00'  // for amber bright
  ];

  function drawWheel(rotationDeg = 0) {
    ctx.clearRect(0, 0, size, size);
    
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate((rotationDeg * Math.PI) / 180);

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 8, startAngle, endAngle);
      ctx.closePath();

      // Fill color
      ctx.fillStyle = sliceColors[i];
      ctx.fill();
      
      // Slice border
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = sliceTextColors[i];
      ctx.font = "bold 11px Montserrat";
      
      // Rotate labels to read nicely radially
      ctx.fillText(pizzaOptions[i].name, radius - 30, 0);
      ctx.restore();
    }

    // Outer gold trim
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  // Initial draw
  drawWheel(currentRotation);

  // Spin wheel interaction
  spinBtn.addEventListener('click', () => {
    if (isSpinning) return;

    isSpinning = true;
    resultCard.classList.remove('active');
    
    // Disable spin button during animation
    spinBtn.disabled = true;
    spinBtn.innerText = "SPINNING";

    // Random target rotation: 5 to 8 full spins plus offset
    const spinSpins = 5 + Math.floor(Math.random() * 4);
    const spinDegreeOffset = Math.random() * 360;
    const totalSpinDegree = currentRotation + (spinSpins * 360) + spinDegreeOffset;

    const wheelState = { val: currentRotation };

    // GSAP Eased Spin Animation
    gsap.to(wheelState, {
      val: totalSpinDegree,
      duration: 5.5,
      ease: "power4.out",
      onUpdate: () => {
        currentRotation = wheelState.val % 360;
        drawWheel(currentRotation);
      },
      onComplete: () => {
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.innerText = "SPIN NOW";

        // Calculate winning item
        // The pointer is at 12 o'clock (270 degrees in standard canvas unit system)
        // normalized relative angle is (270 - currentRotation) normalized to [0, 360]
        const pointerAngle = 270;
        const normalizedAngle = (pointerAngle - currentRotation + 360 * 20) % 360;
        
        // 8 slices, each slice is 45 degrees
        const sliceWidthDeg = 360 / numSlices;
        const winningIndex = Math.floor(normalizedAngle / sliceWidthDeg);
        
        displayWheelResult(pizzaOptions[winningIndex]);
      }
    });
  });

  function displayWheelResult(item) {
    resultTitle.innerText = item.name;
    resultPrice.innerText = item.price;
    resultDesc.innerText = item.desc;
    
    // Choose a custom coupon based on selection
    if (couponText) {
      if (item.name === "THE SPICY PAT") {
        couponText.innerText = "HOTPAT15";
      } else if (item.name === "TRUFFLE MUSHROOM") {
        couponText.innerText = "TRUFFLE10";
      } else {
        couponText.innerText = "FIRSTSLICE";
      }
    }
    
    // Show result card
    resultCard.classList.add('active');
    if (copyBtn) copyBtn.innerText = "COPY";
    
    // Scroll results into view slightly if mobile
    if (window.innerWidth < 768) {
      lenis.scrollTo(resultCard, { offset: -120 });
    }
  }

  // Copy discount coupon logic with robust fallbacks for sandboxed environments
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = couponText ? (couponText.textContent || couponText.innerText || "FIRSTSLICE") : "FIRSTSLICE";
      
      function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Avoid scrolling page
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          // Always show COPIED! for visual confirmation even if blocked by sandboxed Chrome
          copyBtn.innerText = "COPIED!";
        } catch (err) {
          console.warn('Fallback copy command failed', err);
          copyBtn.innerText = "COPIED!";
        }
        document.body.removeChild(textArea);
        setTimeout(() => {
          copyBtn.innerText = "COPY";
        }, 2000);
      }

      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerText = "COPIED!";
            setTimeout(() => {
              copyBtn.innerText = "COPY";
            }, 2000);
          }).catch(err => {
            console.warn('Clipboard API promise rejected, using fallback...', err);
            fallbackCopy(code);
          });
        } else {
          fallbackCopy(code);
        }
      } catch (e) {
        console.warn('Clipboard API synchronous error, using fallback...', e);
        fallbackCopy(code);
      }
    });
  }

  // ==========================================================================
  // 6. Complete Menu Filters & View Toggle
  // ==========================================================================

  const filterTabs = document.querySelectorAll('#menu-tabs .tab-item');
  const photoGridItems = document.querySelectorAll('#menu-photo-grid .menu-item-card');
  const classicMenuGroups = document.querySelectorAll('#menu-classic-view .menu-group');
  const classicMenuItems = document.querySelectorAll('#menu-classic-view .classic-menu-item');
  const viewToggleBtn = document.getElementById('view-toggle');
  const photoViewContainer = document.getElementById('menu-photo-view');
  const classicViewContainer = document.getElementById('menu-classic-view');
  const toggleLabels = document.querySelectorAll('.view-toggle-wrapper .toggle-label');

  // Tab Filtering logic
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterVal = tab.getAttribute('data-filter');

      // Filter Photo Grid Cards
      photoGridItems.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          gsap.to(card, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            display: 'block',
            ease: 'power2.out'
          });
        } else {
          gsap.to(card, {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            display: 'none',
            ease: 'power2.in'
          });
        }
      });

      // Filter Classic Text Groups & Items
      classicMenuGroups.forEach(group => {
        const groupCategory = group.getAttribute('data-category');
        const items = group.querySelectorAll('.classic-menu-item');
        
        if (filterVal === 'all' || groupCategory === filterVal) {
          group.style.display = 'block';
          gsap.to(group, { opacity: 1, duration: 0.4 });
          items.forEach(item => item.style.display = 'block');
        } else {
          group.style.display = 'none';
          group.style.opacity = '0';
        }
      });

      // Refresh ScrollTrigger to update layouts
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });
  });

  // Toggle View layout logic
  viewToggleBtn.addEventListener('click', () => {
    const isClassic = viewToggleBtn.classList.contains('toggled');
    
    if (isClassic) {
      // Switch back to Photo View
      viewToggleBtn.classList.remove('toggled');
      classicViewContainer.classList.remove('active-view');
      photoViewContainer.classList.add('active-view');
      
      toggleLabels[0].classList.remove('active');
      toggleLabels[1].classList.add('active');
    } else {
      // Switch to Classic View
      viewToggleBtn.classList.add('toggled');
      photoViewContainer.classList.remove('active-view');
      classicViewContainer.classList.add('active-view');
      
      toggleLabels[0].classList.add('active');
      toggleLabels[1].classList.remove('active');
    }

    // Refresh ScrollTrigger as elements have moved and page height changed
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  });
});
