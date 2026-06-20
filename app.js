// Register the ScrollTrigger plugin with GSAP (GreenSock Animation Platform) so we can trigger animations on scroll
gsap.registerPlugin(ScrollTrigger);
// Configure GSAP to disable warning messages when a target element is null/not found in the DOM
gsap.config({ nullTargetWarn: false });

// Wait for the complete HTML document to be fully loaded and parsed before executing our scripts
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Smooth Scrolling (Lenis) & GSAP Integration
  // ==========================================================================
  
  // Initialize the Lenis smooth scrolling library with custom configuration options
  const lenis = new Lenis({
    // Duration of the scroll animation in seconds
    duration: 1.2,
    // Easing function for smooth acceleration and deceleration (exponential out easing)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    // Enable smooth scrolling on the mouse wheel input
    smoothWheel: true,
    // Multiplier to adjust touch scroll sensitivity
    touchMultiplier: 2,
    // Disable infinite looping of scroll
    infinite: false,
  });

  // Define the requestAnimationFrame callback loop to update Lenis scrolling smoothly
  function raf(time) {
    // Notify Lenis to process and update the scroll position based on current time
    lenis.raf(time);
    // Recursively request the next animation frame to keep the scroll loop running
    requestAnimationFrame(raf);
  }
  // Start the smooth scrolling animation frame loop
  requestAnimationFrame(raf);

  // Synchronize GSAP's ScrollTrigger with the Lenis smooth scroll update event
  lenis.on('scroll', ScrollTrigger.update);

  // Add Lenis update handler to GSAP's global ticker loop for perfect animation synchronization
  gsap.ticker.add((time) => {
    // Pass elapsed time in milliseconds to Lenis
    lenis.raf(time * 1000);
  });
  // Disable lag smoothing in GSAP to prevent synchronization drift between scroll and animations
  gsap.ticker.lagSmoothing(0);

  // Select all anchor links whose href starts with '#' and set up smooth scrolling to their targets
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Add a click event listener to each anchor link
    anchor.addEventListener('click', function(e) {
      // Prevent the default browser anchor navigation behavior
      e.preventDefault();
      // Retrieve the target selector id from the href attribute
      const targetId = this.getAttribute('href');
      // If the link is just '#' with no target id, return immediately
      if (targetId === '#') return;
      
      // Select the target DOM element corresponding to the targetId
      const targetElement = document.querySelector(targetId);
      // Check if the target element actually exists in the DOM
      if (targetElement) {
        // Close the mobile navigation menu drawer if it is currently open
        closeMobileNav();
        
        // Scroll the viewport to the target element using Lenis
        lenis.scrollTo(targetElement, {
          // Adjust scroll offset to account for the height of the fixed navigation bar
          offset: -80, 
          // Duration of the smooth scroll animation to the target in seconds
          duration: 1.5,
          // Do not jump immediately to the target; perform a smooth transition
          immediate: false
        });
      }
    });
  });

  // ==========================================================================
  // 2. Navigation Header Controls
  // ==========================================================================

  // Get the main header element from the DOM to toggle visual styles on scroll
  const header = document.getElementById('main-header');
  // Get the hamburger button element that toggles the mobile nav menu
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  // Get the navigation menu container element that slides in on mobile devices
  const navMenu = document.getElementById('nav-menu');

  // Add an event listener to the window object to monitor scroll activity
  window.addEventListener('scroll', () => {
    // If the vertical scroll position is greater than 50 pixels
    if (window.scrollY > 50) {
      // Add the 'scrolled' class to style the header with a blurred background and shadow
      header.classList.add('scrolled');
    } else {
      // Remove the 'scrolled' class to restore the header to its transparent state
      header.classList.remove('scrolled');
    }
    
    // Call the function to highlight the active section's nav link in the header
    updateActiveNavLink();
  });

  // Add a click event listener to the mobile nav toggle hamburger button
  mobileNavToggle.addEventListener('click', () => {
    // Check if the navigation menu is currently open by checking for the 'active' class
    const isOpen = navMenu.classList.contains('active');
    // If it is already open, call closeMobileNav, otherwise call openMobileNav
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Helper function to open the mobile navigation menu drawer
  function openMobileNav() {
    // Add 'active' class to slide the navigation menu drawer into view
    navMenu.classList.add('active');
    // Add 'open' class to transform the hamburger lines into an 'X'
    mobileNavToggle.classList.add('open');
    // Update ARIA expanded state to true
    mobileNavToggle.setAttribute('aria-expanded', 'true');
    // Pause Lenis smooth scrolling so user cannot scroll the background page while menu is open
    lenis.stop();
  }

  // Helper function to close the mobile navigation menu drawer
  function closeMobileNav() {
    // Remove 'active' class to slide the navigation menu drawer out of view
    navMenu.classList.remove('active');
    // Remove 'open' class to revert the hamburger icon back to three horizontal lines
    mobileNavToggle.classList.remove('open');
    // Update ARIA expanded state to false
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    // Resume Lenis smooth scrolling for normal page interaction
    lenis.start();
  }

  // Function to highlight navigation links based on which section is currently visible in the viewport
  function updateActiveNavLink() {
    // Calculate the current scroll position offset by 200px to trigger highlight slightly early
    const scrollPos = window.scrollY + 200;
    // Get all navigation links that have the class '.nav-link'
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Select all sections on the page that participate in the scroll highlighting
    document.querySelectorAll('.scroll-section').forEach(section => {
      // Get the vertical offset top position of the section in pixels
      const top = section.offsetTop;
      // Get the total height of the section in pixels
      const height = section.offsetHeight;
      // Get the element ID of the section
      const id = section.getAttribute('id');
      
      // Check if the current scroll position falls within the vertical boundaries of this section
      if (scrollPos >= top && scrollPos < top + height) {
        // Iterate through all navigation links and update classes
        navLinks.forEach(link => {
          // Remove the active class from all links first to clear previous highlights
          link.classList.remove('active');
          // If the link's href corresponds to the current section's ID
          if (link.getAttribute('href') === `#${id}`) {
            // Add the 'active' class to highlight this link
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================================================
  // 3. Dynamic Theme Switching on Scroll (Morphing background)
  // ==========================================================================

  // Select all sections that have a theme transition configured
  const scrollSections = document.querySelectorAll('.scroll-section');
  
  // Iterate through each scroll-sensitive section to bind ScrollTrigger instances
  scrollSections.forEach(section => {
    // Get the theme associated with the section ('light' or 'dark') from its metadata attribute
    const theme = section.getAttribute('data-theme');
    // Create a new ScrollTrigger instance to handle dynamic background color swapping
    ScrollTrigger.create({
      // The element that triggers the animation trigger point
      trigger: section,
      // Trigger theme change when top of section crosses the middle (50%) of the viewport
      start: 'top 50%',
      // End tracking when bottom of section crosses the middle of the viewport
      end: 'bottom 50%',
      // Callback triggered when scrolling down and entering the section
      onEnter: () => toggleBodyTheme(theme),
      // Callback triggered when scrolling up and re-entering the section
      onEnterBack: () => toggleBodyTheme(theme),
    });
  });

  // Helper function to swap the body class list based on the target theme
  function toggleBodyTheme(theme) {
    // If the theme is 'dark', apply dark styling classes
    if (theme === 'dark') {
      // Remove light theme class from body
      document.body.classList.remove('theme-light');
      // Add dark theme class to body
      document.body.classList.add('theme-dark');
    } else {
      // Remove dark theme class from body
      document.body.classList.remove('theme-dark');
      // Add light theme class to body
      document.body.classList.add('theme-light');
    }
  }

  // ==========================================================================
  // 4. GSAP Micro-animations & Scroll Reveals
  // ==========================================================================

  // Retrieve the main hero section title element
  const heroHeading = document.getElementById('hero-heading');
  // Retrieve the hero section subtitle paragraph
  const heroSubheading = document.getElementById('hero-subheading');
  // Query all buttons inside the hero actions container and convert NodeList to an array
  const heroBtns = Array.from(document.querySelectorAll('.hero-actions .btn'));
  // Retrieve the logo element inside the navigation header
  const logoNav = document.getElementById('logo-nav');
  // Select all list items in the main navigation menu and convert to an array
  const navListItems = Array.from(document.querySelectorAll('.nav-list li'));
  // Retrieve the main header call-to-action button
  const navCtaBtn = document.getElementById('nav-cta-btn');
  // Retrieve the scroll indicator element pointing to the intro section
  const scrollIndicator = document.getElementById('scroll-indicator');

  // Initialize a GSAP timeline for sequential entrance animations when page loads
  const heroTL = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
  
  // If the hero heading exists, animate it moving upwards (y: 60 to 0) and fading in
  if (heroHeading) heroTL.from(heroHeading, { y: 60, opacity: 0, delay: 0.2 });
  // If the hero subheading exists, animate it fading in with a slide up, overlapping the previous tween
  if (heroSubheading) heroTL.from(heroSubheading, { y: 30, opacity: 0 }, '-=0.9');
  // If hero buttons exist, animate them sliding up in a staggered succession
  if (heroBtns.length > 0) heroTL.from(heroBtns, { y: 20, opacity: 0, stagger: 0.15 }, '-=0.8');
  // If nav logo exists, animate it fading in and sliding from left side
  if (logoNav) heroTL.from(logoNav, { opacity: 0, x: -30 }, '-=1');
  // If navigation list items exist, stagger their drop down and fade in
  if (navListItems.length > 0) heroTL.from(navListItems, { opacity: 0, y: -10, stagger: 0.1 }, '-=0.8');
  // If the header action button exists, scale it up and fade in smoothly
  if (navCtaBtn) heroTL.from(navCtaBtn, { opacity: 0, scale: 0.9 }, '-=0.6');
  // If the scroll indicator exists, slide it up slightly and fade it in at the end
  if (scrollIndicator) heroTL.from(scrollIndicator, { opacity: 0, y: 10 }, '-=0.4');

  // Retrieve the background image element of the hero section
  const heroBgImg = document.getElementById('hero-bg-img');
  // Retrieve the outer hero section container
  const heroSection = document.getElementById('hero');
  // If both hero background image and hero section exist, build the scroll parallax effect
  if (heroBgImg && heroSection) {
    gsap.to(heroBgImg, {
      // Translate the background image downwards by 15% during scroll
      yPercent: 15,
      // Use linear easing to sync perfectly with the native scroll bar
      ease: 'none',
      scrollTrigger: {
        // Set the trigger element as the hero section
        trigger: heroSection,
        // Start parallax when top of hero hits the top of viewport
        start: 'top top',
        // Complete parallax when bottom of hero reaches top of viewport
        end: 'bottom top',
        // Link the scroll progress directly to the animation playhead (smooth scrubbing)
        scrub: true
      }
    });
  }

  // Iterate over all elements designated for a left-to-right fade-in reveal
  gsap.utils.toArray('.reveal-left').forEach(element => {
    gsap.from(element, {
      // Offset starting position to 60px on the left
      x: -60,
      // Start animation with 0 opacity
      opacity: 0,
      // Animation duration in seconds
      duration: 1.2,
      // Use clean power3 out easing for deceleration
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        // Trigger reveal when top of the element gets within 85% of viewport height
        start: 'top 85%',
        // Play the animation forwards when entering, reverse it when scrolling back up
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Iterate over all elements designated for a right-to-left fade-in reveal
  gsap.utils.toArray('.reveal-right').forEach(element => {
    gsap.from(element, {
      // Offset starting position to 60px on the right
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

  // Iterate over all elements designated for an upward slide fade-in reveal
  gsap.utils.toArray('.reveal-up').forEach(element => {
    gsap.from(element, {
      // Offset starting position downwards by 50px
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

  // Locate card grids and animate their nested child cards in a staggered reveal pattern
  gsap.utils.toArray('.card-grid').forEach(grid => {
    // Gather all card container wrappers within this specific grid
    const cards = Array.from(grid.querySelectorAll('.card-reveal'));
    // If cards exist, build the staggered animation trigger
    if (cards.length > 0) {
      gsap.from(cards, {
        // Offset starting position downwards
        y: 40,
        opacity: 0,
        duration: 0.8,
        // Delay between the start of each individual card animation
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          // Start when top of grid enters 80% height of the viewport
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });

  // Create subtle vertical parallax shifts for section illustration/photo images
  gsap.utils.toArray('.parallax-img').forEach(img => {
    gsap.to(img, {
      // Shift image up by 10% of its own height as scroll occurs
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        // Use parent wrapper container bounds for scroll boundaries
        trigger: img.parentElement,
        // Start animation when top of parent container reaches bottom of viewport
        start: 'top bottom',
        // Finish animation when bottom of parent container reaches top of viewport
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // ==========================================================================
  // 5. Interactive Pizza Spinning Wheel ("Pick Me")
  // ==========================================================================

  // Get the HTML5 Canvas element configured for rendering the pizza wheel
  const canvas = document.getElementById('pizza-wheel');
  // Get the 2D rendering context for drawing on the canvas
  const ctx = canvas.getContext('2d');
  // Get the button that initiates the spinning animation
  const spinBtn = document.getElementById('spin-btn');
  // Get the card element containing recommendation details
  const resultCard = document.getElementById('wheel-result-card');
  // Get the text element for the recommended pizza's name
  const resultTitle = document.getElementById('result-pizza-name');
  // Get the text element showing the recommended item's price
  const resultPrice = document.getElementById('result-pizza-price');
  // Get the paragraph element detailing ingredients/toppings
  const resultDesc = document.getElementById('result-pizza-desc');
  // Get the button that copies the coupon discount code to clipboard
  const copyBtn = document.getElementById('copy-coupon-btn');
  // Get the code element holding the textual discount code string
  const couponText = document.getElementById('coupon-code-text');

  // Define the list of items displayed on the wheel, with associated details
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

  // Set local size measurements of the canvas (width and height are equal)
  const size = canvas.width;
  // Calculate the radius of the wheel (half the diameter/size)
  const radius = size / 2;
  // Determine how many slices make up the wheel (8 slices total)
  const numSlices = pizzaOptions.length;
  // Calculate the angle width of a single slice in radians
  const sliceAngle = (2 * Math.PI) / numSlices;
  
  // Track current visual rotation in degrees
  let currentRotation = 0; 
  // State boolean to prevent concurrent spin triggers
  let isSpinning = false;

  // Curated color palette representing brand guidelines for slices
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

  // High contrast text colors matched sequentially to each slice fill color
  const sliceTextColors = [
    '#ffffff', // matched with Deep Red
    '#ffffff', // matched with Charcoal
    '#1c1c18', // matched with Warm Cream
    '#ffffff', // matched with Golden Amber
    '#ffffff', // matched with Deep Crimson
    '#1c1c18', // matched with High Surface
    '#ffffff', // matched with Charcoal Darker
    '#724d00'  // matched with Amber Bright
  ];

  // Function that handles rendering the complete canvas wheel at a given rotation
  function drawWheel(rotationDeg = 0) {
    // Clear previous frame pixels before drawing the new frame
    ctx.clearRect(0, 0, size, size);
    
    // Save current graphics state (translation, rotation matrix)
    ctx.save();
    // Translate origin coordinates from top-left (0,0) to center of canvas (radius, radius)
    ctx.translate(radius, radius);
    // Rotate canvas context coordinate system to current rotation angle in radians
    ctx.rotate((rotationDeg * Math.PI) / 180);

    // Draw slices in a loop
    for (let i = 0; i < numSlices; i++) {
      // Calculate starting angle boundary for current slice
      const startAngle = i * sliceAngle;
      // Calculate ending angle boundary for current slice
      const endAngle = startAngle + sliceAngle;

      // Start path definition
      ctx.beginPath();
      // Move pen to center hub origin (0, 0)
      ctx.moveTo(0, 0);
      // Draw outer circle arc representing the slice boundary, inset by 8px for trim space
      ctx.arc(0, 0, radius - 8, startAngle, endAngle);
      // Close path back to center hub origin (0,0)
      ctx.closePath();

      // Set fill style to current slice color index
      ctx.fillStyle = sliceColors[i];
      // Paint the slice interior path on canvas
      ctx.fill();
      
      // Configure slice line borders
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      // Border line thickness
      ctx.lineWidth = 1.5;
      // Draw outline border stroke
      ctx.stroke();

      // Save canvas state before transforming context to draw text label
      ctx.save();
      // Rotate context axis to point exactly down the center line of current slice
      ctx.rotate(startAngle + sliceAngle / 2);
      // Align text to align right (anchored towards outer edge of the wheel)
      ctx.textAlign = "right";
      // Center text vertically relative to the baseline
      ctx.textBaseline = "middle";
      // Select appropriate high contrast text color for readability
      ctx.fillStyle = sliceTextColors[i];
      // Configure typography font style, weight, and family
      ctx.font = "bold 11px Montserrat";
      
      // Draw label string text offset inwards from outer wheel edge by 30px
      ctx.fillText(pizzaOptions[i].name, radius - 30, 0);
      // Revert coordinate modifications for the text label drawing step
      ctx.restore();
    }

    // Begin drawing the outer gold decorative trim
    ctx.beginPath();
    // Path for outer circle border
    ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI);
    // Gold trim color property
    ctx.strokeStyle = '#F2C94C';
    // Border stroke weight
    ctx.lineWidth = 4;
    ctx.stroke();

    // Begin drawing the static center hub cover
    ctx.beginPath();
    // Inner center circle arc
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    // Set hub color
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    // Hub gold border
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Revert context translations and rotation matrices back to default coordinate system
    ctx.restore();
  }

  // Draw the initial wheel state immediately on load (at 0 degrees rotation)
  drawWheel(currentRotation);

  // Bind a click event listener to the spin action button
  spinBtn.addEventListener('click', () => {
    // If the wheel is already in motion, ignore additional trigger requests
    if (isSpinning) return;

    // Set state boolean to block click events while animation is running
    isSpinning = true;
    // Hide the recommendation result card so it transitions in fresh after spin completes
    resultCard.classList.remove('active');
    
    // Disable the spin button to indicate operational block
    spinBtn.disabled = true;
    // Change button text to reflect active state
    spinBtn.innerText = "SPINNING";

    // Randomize rotation parameters: 5 to 8 complete spins + random residual offset
    const spinSpins = 5 + Math.floor(Math.random() * 4);
    const spinDegreeOffset = Math.random() * 360;
    // Compute cumulative target degrees for GSAP rotation mapping
    const totalSpinDegree = currentRotation + (spinSpins * 360) + spinDegreeOffset;

    // Local object proxy holding state values for GSAP numerical interpolation
    const wheelState = { val: currentRotation };

    // Trigger the GSAP Eased Spin Animation
    gsap.to(wheelState, {
      // Target rotation degree to interpolate towards
      val: totalSpinDegree,
      // Length of spin transition in seconds
      duration: 5.5,
      // Strong cubic deceleration curve for natural deceleration look
      ease: "power4.out",
      // Frame-by-frame update callback to draw the wheel state
      onUpdate: () => {
        // Keep current rotation state normalized within [0, 360] boundary
        currentRotation = wheelState.val % 360;
        // Redraw wheel frame
        drawWheel(currentRotation);
      },
      // Callback executed when rotation stops completely
      onComplete: () => {
        // Re-enable interface controls
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.innerText = "SPIN NOW";

        // Calculate winning index based on final resting position
        // Standard canvas unit system places 0 degrees at 3 o'clock.
        // The static pointer arrow is located at 12 o'clock (which translates to 270 degrees)
        const pointerAngle = 270;
        // Normalize rotation offset relative to the pointer angle
        const normalizedAngle = (pointerAngle - currentRotation + 360 * 20) % 360;
        
        // Find which slice range the pointer falls within (8 slices = 45 degrees each)
        const sliceWidthDeg = 360 / numSlices;
        const winningIndex = Math.floor(normalizedAngle / sliceWidthDeg);
        
        // Render details of winning pizza inside the result container card
        displayWheelResult(pizzaOptions[winningIndex]);
      }
    });
  });

  // Function to render results data on page and trigger slide transition
  function displayWheelResult(item) {
    // Inject the recommended pizza name text
    resultTitle.innerText = item.name;
    // Inject pricing string
    resultPrice.innerText = item.price;
    // Inject description block
    resultDesc.innerText = item.desc;
    
    // Check if the discount coupon code node is available in the DOM
    if (couponText) {
      // Map custom code names depending on which item won the spin selection
      if (item.name === "THE SPICY PAT") {
        couponText.innerText = "HOTPAT15";
      } else if (item.name === "TRUFFLE MUSHROOM") {
        couponText.innerText = "TRUFFLE10";
      } else {
        couponText.innerText = "FIRSTSLICE";
      }
    }
    
    // Add active class to transition result card into view (opacity, translate properties)
    resultCard.classList.add('active');
    // If copy coupon button exists, reset label back to default COPY text
    if (copyBtn) copyBtn.innerText = "COPY";
    
    // Scroll page view down to the result card on mobile screens for convenience
    if (window.innerWidth < 768) {
      lenis.scrollTo(resultCard, { offset: -120 });
    }
  }

  // Copy discount coupon logic with robust fallbacks for sandboxed environments
  if (copyBtn) {
    // Add click event listener to the copy button action
    copyBtn.addEventListener('click', () => {
      // Get the raw text content of the coupon code, with FIRSTSLICE as baseline fallback
      const code = couponText ? (couponText.textContent || couponText.innerText || "FIRSTSLICE") : "FIRSTSLICE";
      
      // Fallback copy execution block for older browsers or sandboxed security restrictions
      function fallbackCopy(text) {
        // Create a temporary textarea DOM node to facilitate manual document copying
        const textInputArea = document.createElement("textarea");
        // Assign target copy code text to textarea
        textInputArea.value = text;
        // Absolute position hide textarea off-screen to avoid layout shifts
        textInputArea.style.position = "fixed"; 
        textInputArea.style.left = "-9999px";
        // Append input node to document tree
        document.body.appendChild(textInputArea);
        // Focus the hidden field
        textInputArea.focus();
        // Select text content inside the field
        textInputArea.select();
        try {
          // Fire synchronous document copy command
          document.execCommand('copy');
          // Update button label to indicate copy action success
          copyBtn.innerText = "COPIED!";
        } catch (err) {
          // Log fallback error warning in console
          console.warn('Fallback copy command failed', err);
          // Set label anyway to ensure optimal user experience feedback
          copyBtn.innerText = "COPIED!";
        }
        // Remove temporary node from DOM to keep it clean
        document.body.removeChild(textInputArea);
        // Revert copy button label back to COPY state after a 2-second delay
        setTimeout(() => {
          copyBtn.innerText = "COPY";
        }, 2000);
      }

      try {
        // If modern Clipboard API is supported by the browser environment
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          // Execute async promise write call
          navigator.clipboard.writeText(code).then(() => {
            // Update button text
            copyBtn.innerText = "COPIED!";
            // Reset button text after 2 seconds
            setTimeout(() => {
              copyBtn.innerText = "COPY";
            }, 2000);
          }).catch(err => {
            // If clipboard write promise gets rejected, fall back to textarea copy
            console.warn('Clipboard API promise rejected, using fallback...', err);
            fallbackCopy(code);
          });
        } else {
          // Clipboard API not supported, execute fallback directly
          fallbackCopy(code);
        }
      } catch (e) {
        // Catch any unforeseen synchronous exceptions and run the fallback
        console.warn('Clipboard API synchronous error, using fallback...', e);
        fallbackCopy(code);
      }
    });
  }

  // ==========================================================================
  // 6. Complete Menu Filters & View Toggle
  // ==========================================================================

  // Select all individual category filter tab items
  const filterTabs = document.querySelectorAll('#menu-tabs .tab-item');
  // Select all product card wrappers inside the menu's main photo view layout grid
  const photoGridItems = document.querySelectorAll('#menu-photo-grid .menu-item-card');
  // Select all food category blocks inside the classic text-only layout view
  const classicMenuGroups = document.querySelectorAll('#menu-classic-view .menu-group');
  // Select all inline text rows representing individual dishes in the classic view
  const classicMenuItems = document.querySelectorAll('#menu-classic-view .classic-menu-item');
  // Get the toggle button element that switches between Photo Grid and Classic Text view layouts
  const viewToggleBtn = document.getElementById('view-toggle');
  // Get the container wrapping the photo card grid layout
  const photoViewContainer = document.getElementById('menu-photo-view');
  // Get the container wrapping the minimal text list layout
  const classicViewContainer = document.getElementById('menu-classic-view');
  // Select both label elements representing layout state descriptions
  const toggleLabels = document.querySelectorAll('.view-toggle-wrapper .toggle-label');

  // Loop through filter tab nodes and bind click behaviors
  filterTabs.forEach(tab => {
    // Click event to update filter results and ARIA tags
    tab.addEventListener('click', () => {
      // Remove 'active' selection class and disable ARIA selection state on all tabs
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      // Add 'active' class to current tab to update underline position and set ARIA selected true
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Get category filter target string value from tab data attribute
      const filterVal = tab.getAttribute('data-filter');

      // Filter Photo Grid Cards
      photoGridItems.forEach(card => {
        // Retrieve card category
        const itemCategory = card.getAttribute('data-category');
        // If current selection is 'all' or matches specific card category
        if (filterVal === 'all' || itemCategory === filterVal) {
          // Animate card scaling up and fading in smoothly using GSAP
          gsap.to(card, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            display: 'block',
            ease: 'power2.out'
          });
        } else {
          // Animate card scaling down and fading out out of view
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
        // Retrieve category associated with text group block
        const groupCategory = group.getAttribute('data-category');
        // Retrieve all individual menu rows inside current group block
        const items = group.querySelectorAll('.classic-menu-item');
        
        // If selection is set to 'all' or matches this group category
        if (filterVal === 'all' || groupCategory === filterVal) {
          // Display the category block
          group.style.display = 'block';
          // Fade in group content
          gsap.to(group, { opacity: 1, duration: 0.4 });
          // Ensure nested item rows are styled block
          items.forEach(item => item.style.display = 'block');
        } else {
          // Hide category block and set opacity to 0
          group.style.display = 'none';
          group.style.opacity = '0';
        }
      });

      // Refresh ScrollTrigger positions after layout dimensions settle (delay 500ms)
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    // Keyboard support: listen for Enter and Space key presses when tab has focus
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // Add click event listener to layout view toggle switch
  viewToggleBtn.addEventListener('click', () => {
    // Check if the toggle has the class 'toggled' (meaning Classic view is currently selected)
    const isClassic = viewToggleBtn.classList.contains('toggled');
    
    if (isClassic) {
      // Revert back to photo card layout view
      viewToggleBtn.classList.remove('toggled');
      viewToggleBtn.setAttribute('aria-pressed', 'false');
      classicViewContainer.classList.remove('active-view');
      photoViewContainer.classList.add('active-view');
      
      // Update label weights
      toggleLabels[0].classList.remove('active');
      toggleLabels[1].classList.add('active');
    } else {
      // Switch layout to classic text list view
      viewToggleBtn.classList.add('toggled');
      viewToggleBtn.setAttribute('aria-pressed', 'true');
      photoViewContainer.classList.remove('active-view');
      classicViewContainer.classList.add('active-view');
      
      // Update label weights
      toggleLabels[0].classList.add('active');
      toggleLabels[1].classList.remove('active');
    }

    // Immediately request ScrollTrigger to recalculate layout offsets as height changed
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  });
});
