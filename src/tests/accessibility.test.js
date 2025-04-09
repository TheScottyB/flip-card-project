const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const path = require('path');

describe('Flip Card Accessibility Tests', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the test page
    const testPagePath = path.join(__dirname, '../../multi-card.html');
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  // ARIA Attributes Test
  test('should have proper ARIA attributes on flip triggers', async () => {
    const flipTriggers = await page.$$('.flip-trigger');
    expect(flipTriggers.length).toBeGreaterThan(0);
    
    for (const button of flipTriggers) {
      const attributes = await page.evaluate(el => ({
        role: el.getAttribute('role') || el.tagName.toLowerCase(),
        ariaPressed: el.getAttribute('aria-pressed'),
        ariaExpanded: el.getAttribute('aria-expanded'),
        ariaControls: el.getAttribute('aria-controls'),
        ariaLabel: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      }), button);
      
      // Verify critical ARIA attributes
      expect(attributes.ariaPressed).not.toBeNull();
      expect(attributes.ariaControls).not.toBeNull();
      expect(attributes.ariaLabel).not.toBeNull();
    }
  });
  
  // Keyboard Navigation Tests
  test('should support keyboard navigation', async () => {
    // Focus first button
    await page.keyboard.press('Tab');
    
    // Check focus state
    const focusedEl = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el.tagName.toLowerCase(),
        classList: Array.from(el.classList)
      };
    });
    
    // Should focus either the skip link or the first interactive element
    expect(['a', 'button'].includes(focusedEl.tagName)).toBe(true);
    
    // Continue tabbing until we find a flip trigger
    let foundFlipTrigger = false;
    for (let i = 0; i < 10; i++) { // Limit to 10 tabs to avoid infinite loop
      await page.keyboard.press('Tab');
      
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el.tagName.toLowerCase(),
          classList: Array.from(el.classList),
          ariaLabel: el.getAttribute('aria-label')
        };
      });
      
      if (activeElement.classList.includes('flip-trigger')) {
        foundFlipTrigger = true;
        break;
      }
    }
    
    expect(foundFlipTrigger).toBe(true);
    
    // Flip card with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500); // Wait for animation
    
    // Verify card flipped
    const isFlipped = await page.evaluate(() => {
      return document.activeElement.closest('.flip-card').classList.contains('flipped');
    });
    expect(isFlipped).toBe(true);
    
    // Flip back with Escape 
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const isUnflipped = await page.evaluate(() => {
      return !document.activeElement.closest('.flip-card').classList.contains('flipped');
    });
    expect(isUnflipped).toBe(true);
  });
  
  // Focus Management Tests
  test('should properly manage focus during interactions', async () => {
    // Find the first flip trigger
    const flipTrigger = await page.$('.flip-trigger');
    await flipTrigger.focus();
    
    const initialFocus = await page.evaluate(() => {
      return document.activeElement.getAttribute('aria-label');
    });
    
    // Activate the flip
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const newFocus = await page.evaluate(() => {
      return document.activeElement.getAttribute('aria-label');
    });
    
    // Focus should move to a different element after flip
    expect(newFocus).not.toBe(initialFocus);
  });
  
  // ARIA Live Region Tests
  test('should have working ARIA live region', async () => {
    const liveRegion = await page.$('[aria-live]');
    expect(liveRegion).not.toBeNull();
    
    // Clear any existing announcements
    await page.evaluate(() => {
      const liveRegion = document.querySelector('[aria-live]');
      if (liveRegion) liveRegion.textContent = '';
    });
    
    // Get the first flip trigger and click it
    const flipTrigger = await page.$('.flip-trigger');
    await flipTrigger.click();
    await page.waitForTimeout(500);
    
    // Check for announcement
    const hasAnnouncement = await page.evaluate(() => {
      const liveRegion = document.querySelector('[aria-live]');
      return liveRegion && liveRegion.textContent.trim() !== '';
    });
    
    expect(hasAnnouncement).toBe(true);
  });
  
  // Color Contrast Test
  test('should meet minimum color contrast requirements', async () => {
    const results = await new AxePuppeteer(page)
      .withRules(['color-contrast'])
      .analyze();
    
    const contrastViolations = results.violations.filter(
      v => v.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  });
  
  // Full Accessibility Scan
  test('should pass basic accessibility checks', async () => {
    const results = await new AxePuppeteer(page)
      .include('.card-grid') // Focus on the card components
      .analyze();
    
    // Log any violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', 
        results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
      );
    }
    
    // Critical issues that must be fixed
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toHaveLength(0);
  });
  
  // Reduced Motion Test
  test('should respect prefers-reduced-motion setting', async () => {
    // Emulate prefers-reduced-motion
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ]);
    
    // Check if transition is disabled
    const hasReducedMotion = await page.evaluate(() => {
      const cardInner = document.querySelector('.flip-card-inner');
      const styles = window.getComputedStyle(cardInner);
      return styles.transition === 'none 0s ease 0s';
    });
    
    expect(hasReducedMotion).toBe(true);
    
    // Reset media features
    await page.emulateMediaFeatures([]);
  });
});