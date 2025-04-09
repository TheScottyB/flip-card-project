        ariaControls: el.getAttribute('aria-controls'),
        ariaLabel: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      }), button);

      expect(attributes.role).toBe('button');
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
    
    expect(focusedEl.classList).toContain('flip-button');
    
    // Flip card with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500); // Wait for animation
    
    // Verify card flipped
    const isFlipped = await page.evaluate(() => {
      return document.querySelector('.flip-card-inner').classList.contains('flipped');
    });
    expect(isFlipped).toBe(true);
    
    // Flip back with Escape 
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const isUnflipped = await page.evaluate(() => {
      return !document.querySelector('.flip-card-inner').classList.contains('flipped');
    });
    expect(isUnflipped).toBe(true);
  });

  // Focus Management Tests
  test('should properly manage focus during interactions', async () => {
    await page.focus('.flip-button');
    
    const initialFocus = await page.evaluate(() => {
      return document.activeElement.textContent.trim();
    });
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const newFocus = await page.evaluate(() => {
      return document.activeElement.textContent.trim();
    });
    
    expect(newFocus).not.toBe(initialFocus);
  });

  // ARIA Live Region Tests
  test('should have working ARIA live region', async () => {
    const liveRegion = await page.$('[aria-live]');
    expect(liveRegion).not.toBeNull();
    
    const initialStatus = await page.evaluate(el => el.textContent.trim(), liveRegion);
    
    await page.click('.flip-button');
    await page.waitForTimeout(500);
    
    const updatedStatus = await page.evaluate(el => el.textContent.trim(), liveRegion);
    expect(updatedStatus).not.toBe(initialStatus);
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
});

