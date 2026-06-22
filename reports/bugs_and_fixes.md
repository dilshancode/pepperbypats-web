# 🐛 Bugs & Fixes

This document details the issues and bugs identified in the Pepper by Pats codebase, along with recommended fixes.

---

## 1. Missing Favicon.ico (404 Not Found)
*   **Description:** On page load, the browser attempts to fetch the website's favicon from `http://localhost:8084/favicon.ico`, returning a `404 Not Found` error in the browser console.
*   **Severity:** Low (Visual / Console Hygiene)
*   **Location:** [index.html](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/index.html)
*   **Fix:**
    Add a favicon resource link inside the `<head>` section of `index.html` and place a `favicon.ico` (or a png/webp favicon) inside the `assets/` directory.
    ```html
    <!-- Add this to index.html <head> -->
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    ```

---

## 2. Navigation Link Active Highlight Gap
*   **Description:** When scrolling through intermediate sections that are not represented in the header navigation (such as the introductory `#intro` section, the `#pickme` pizza wheel section, or the `#signature` creations grid), the `.active` class is cleared from all navigation links. This leaves the header menu with no highlighted active section during scroll.
*   **Severity:** Medium (UX / Navigation clarity)
*   **Location:** [app.js](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/app.js) inside the `updateActiveNavLink()` function.
*   **Fix:**
    Update the scroll highlighting logic so that the active state is only changed or cleared when entering a section that actually has a corresponding header navigation link.
    ```javascript
    // In app.js: updateActiveNavLink()
    function updateActiveNavLink() {
      const scrollPos = window.scrollY + 200;
      const navLinks = document.querySelectorAll('.nav-link');
      
      let currentSectionId = '';
      
      document.querySelectorAll('.scroll-section').forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
          // Verify if there is a nav link for this section id
          const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (matchingLink) {
            currentSectionId = id;
          }
        }
      });
      
      // Only update if a valid matching section was detected in viewport
      if (currentSectionId) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
          }
        });
      }
    }
    ```

---

## 3. Asymmetric Layout / Empty Column in Classic Menu View Filter
*   **Description:** In `index.html`, the classic menu layout uses a two-column grid (`.text-menu-grid`) consisting of a left column (`.text-menu-column` for pizzas & desserts) and a right column (`.text-menu-column` for sides & beverages). When filtering by specific categories (e.g., clicking the "WOOD-FIRED PIZZAS" tab), the groups inside the right column are hidden. This leaves the right column completely empty, making the layout asymmetric and leaving a large empty space on the screen.
*   **Severity:** Medium (Visual / Layout consistency)
*   **Location:** [index.html](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/index.html#L606-L791) & [app.js](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/app.js#L793-L812)
*   **Fix:**
    Toggle visibility or adjust display styles of the grid columns when filtering. Alternatively, transition the layout to a single column grid (`grid-template-columns: 1fr`) or update the styles dynamically when a single category is filtered, keeping the double-column grid only when "ALL" is selected.

---

## 4. Hardcoded Navigation Height Offset in Lenis Scrolling
*   **Description:** In `app.js`, the scroll offset when clicking navigation anchor links is hardcoded to `-80` to account for the height of the fixed header:
    ```javascript
    lenis.scrollTo(targetElement, {
      offset: -80,
      ...
    });
    ```
    If the navigation bar height changes dynamically (e.g. smaller screen viewports via CSS media queries), this offset becomes inaccurate, causing elements to be partially hidden or misaligned under the header.
*   **Severity:** Low (Responsive Design / Positioning)
*   **Location:** [app.js](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/app.js#L89)
*   **Fix:**
    Calculate the offset height of the fixed header dynamically instead of hardcoding the value:
    ```javascript
    const headerHeight = document.getElementById('main-header').offsetHeight;
    lenis.scrollTo(targetElement, {
      offset: -headerHeight, 
      duration: 1.5,
      immediate: false
    });
    ```

---

## 5. Potential Performance Overhead in GSAP Target Selectors
*   **Description:** The script calls several `gsap.from` animations targeting general utility classes like `.reveal-left`, `.reveal-right`, `.reveal-up`, and `.card-grid` on load:
    ```javascript
    gsap.utils.toArray('.reveal-left').forEach(element => { ... });
    ```
    If these elements are missing from the DOM (e.g., if a subpage or a different page version is loaded using the same JS script), GSAP will trigger warnings or process empty arrays.
*   **Severity:** Low (Code Quality / Performance)
*   **Location:** [app.js](file:///c:/Users/SADINSA/Desktop/Upwork/PepperByPats/Project01/app.js#L309-L384)
*   **Fix:**
    Verify if elements exist before triggering ScrollTriggers:
    ```javascript
    const leftElements = gsap.utils.toArray('.reveal-left');
    if (leftElements.length > 0) {
      leftElements.forEach(element => {
        // trigger animation
      });
    }
    ```
