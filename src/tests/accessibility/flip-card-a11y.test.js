import { axe, toHaveNoViolations } from 'jest-axe';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

expect.extend(toHaveNoViolations);

describe('Flip Card Accessibility Tests', () => {
  let dom;
  let container;

  beforeAll(() => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf8');
    dom = new JSDOM(html);
    container = dom.window.document.body;
  });

  test('Flip Card Component has no accessibility violations', async () => {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Flip Card has proper ARIA attributes', () => {
    const flipCard = container.querySelector('.flip-card');
    expect(flipCard).toBeTruthy();
    expect(flipCard.getAttribute('role')).toBe('button');
    expect(flipCard.getAttribute('aria-pressed')).toBeDefined();
  });

  test('Flip Card has keyboard support', () => {
    const flipCard = container.querySelector('.flip-card');
    expect(flipCard.getAttribute('tabindex')).toBe('0');
  });

  test('Flip Card has proper focus management', () => {
    const flipCard = container.querySelector('.flip-card');
    const focusableElements = flipCard.querySelectorAll('[tabindex="0"]');
    expect(focusableElements.length).toBeGreaterThan(0);
  });
}); 