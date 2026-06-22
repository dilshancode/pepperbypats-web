# 🚀 Improvements & Enhancements

This document highlights recommended user experience, performance, accessibility, and architectural improvements for the Pepper by Pats web application.

---

## 1. User Preference Persistence (Theme & View Mode)
*   **Improvement:** Store the user's selected menu view mode ("Classic View" vs. "Photo View") in `localStorage`.
*   **Benefit:** When users return to the website or refresh the page, their preferred layout will be loaded automatically, creating a more personalized and seamless browsing experience.
*   **Suggested Implementation:**
    ```javascript
    // Saving preference
    viewToggleBtn.addEventListener('click', () => {
      const isClassic = viewToggleBtn.classList.contains('toggled');
      localStorage.setItem('preferredMenuView', isClassic ? 'photo' : 'classic');
    });

    // Loading preference on DOMContentLoaded
    const savedView = localStorage.getItem('preferredMenuView');
    if (savedView === 'classic') {
      // Trigger classic view activation styles
    }
    ```

---

## 2. Coupon Code Persistence
*   **Improvement:** Store the unlocked discount code (e.g., `HOTPAT15`, `TRUFFLE10`, `FIRSTSLICE`) in `localStorage` once the pizza wheel completes its spin.
*   **Benefit:** If the user spins the wheel, wins a discount, and accidentally refreshes the page or navigates away to check directions, they will not lose their coupon. The site can display the active coupon in the hero section or header once unlocked.
*   **Suggested Implementation:**
    Save the code on spin completion and check for an existing coupon on page load to display an "Active Coupon" banner.

---

## 3. Visual Feedback on Clipboard Copy
*   **Improvement:** When the user clicks the "COPY" button for the discount coupon, add a visual transition class (e.g., temporary green or amber background, a scale animation, or a sliding toast notification).
*   **Benefit:** A visual change is much more noticeable and satisfying to the user than a simple text-label update, confirming the action clearly and adding to the premium feel of the site.

---

## 4. Responsive Images (srcset and sizes)
*   **Improvement:** Implement responsive image loading using the `srcset` and `sizes` attributes for heavy webp assets (especially the hero background and menu grid pizza photos).
*   **Benefit:** Speeds up initial loading times and saves mobile bandwidth by serving smaller, scaled versions of the images to smaller screens (mobile and tablets) instead of loading the full desktop resolution.
*   **Suggested Implementation:**
    ```html
    <img src="assets/spicy_pat_pizza.webp" 
         srcset="assets/spicy_pat_pizza-sm.webp 400w, 
                 assets/spicy_pat_pizza.webp 800w" 
         sizes="(max-w: 600px) 400px, 800px" 
         alt="The Spicy Pat pizza">
    ```

---

## 5. Keyboard Navigation & Focus Ring Enhancements (Accessibility)
*   **Improvement:** Style custom, high-visibility focus states (`:focus-visible`) for all interactive elements, including category tabs, layout view toggles, the spin button, and custom input fields.
*   **Benefit:** Ensures that keyboard-only users and screen readers can clearly identify which element is focused, bringing the project into compliance with modern web accessibility guidelines (WCAG 2.1).

---

## 6. Centralized Configuration for Animations
*   **Improvement:** Group configuration constants (like the magnetic button pull factor, Lenis scroll duration, and pizza wheel options) into a clean, unified config object at the top of `app.js`.
*   **Benefit:** Improves code maintainability and allows designers or developers to easily modify animation variables, scroll speeds, or pizza items in a single, well-documented location.
*   **Suggested Implementation:**
    ```javascript
    const CONFIG = {
      magneticPull: 0.35,
      scrollDuration: 1.2,
      spinDuration: 5.5,
      // options...
    };
    ```

---

## 7. Brand Spelling & Text Consistency
*   **Improvement:** Standardize terms across the codebase. For example, the website mixes British spelling ("fiery flavours", "favour") and US spelling ("flavor", "colors") inside elements and stylesheets.
*   **Benefit:** Unifying spelling conventions maintains high brand standards and professionalism.
