import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/testHelpers.js';

test.describe('BrandVoice Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('complete workflow - fashion brand scenario', async ({ page }) => {
    const testData = TestHelpers.getTestData().fashionBrand;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    
    // Wait for content generation
    await TestHelpers.waitForContentGeneration(page);
    
    // Verify all platforms generated content
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
    
    // Check brand voice scores
    const linkedinScore = await TestHelpers.getBrandVoiceScore(page, 'linkedin');
    const twitterScore = await TestHelpers.getBrandVoiceScore(page, 'twitter');
    const instagramScore = await TestHelpers.getBrandVoiceScore(page, 'instagram');
    
    expect(TestHelpers.isScoreValid(linkedinScore)).toBe(true);
    expect(TestHelpers.isScoreValid(twitterScore)).toBe(true);
    expect(TestHelpers.isScoreValid(instagramScore)).toBe(true);
    
    // Check character counts
    const linkedinCount = await TestHelpers.getCharacterCount(page, 'linkedin');
    const twitterCount = await TestHelpers.getCharacterCount(page, 'twitter');
    const instagramCount = await TestHelpers.getCharacterCount(page, 'instagram');
    
    expect(linkedinCount).toBeGreaterThan(0);
    expect(twitterCount).toBeGreaterThan(0);
    expect(instagramCount).toBeGreaterThan(0);
    
    // Test copy functionality
    await TestHelpers.copyContent(page, 'linkedin');
    expect(await TestHelpers.hasSuccess(page)).toBe(true);
    
    // Test regeneration
    await TestHelpers.regeneratePlatform(page, 'twitter');
    await TestHelpers.waitForContentGeneration(page);
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
  });

  test('complete workflow - tech startup scenario', async ({ page }) => {
    const testData = TestHelpers.getTestData().techStartup;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    
    // Wait for content generation
    await TestHelpers.waitForContentGeneration(page);
    
    // Verify all platforms generated content
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
    
    // Check that content contains relevant keywords
    const linkedinContent = await TestHelpers.getGeneratedContent(page, 'linkedin');
    const twitterContent = await TestHelpers.getGeneratedContent(page, 'twitter');
    const instagramContent = await TestHelpers.getGeneratedContent(page, 'instagram');
    
    expect(linkedinContent.toLowerCase()).toContain('ai');
    expect(twitterContent.toLowerCase()).toContain('ai');
    expect(instagramContent.toLowerCase()).toContain('ai');
  });

  test('complete workflow - coffee shop scenario', async ({ page }) => {
    const testData = TestHelpers.getTestData().coffeeShop;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    
    // Wait for content generation
    await TestHelpers.waitForContentGeneration(page);
    
    // Verify all platforms generated content
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
    
    // Check that content has casual tone
    const linkedinContent = await TestHelpers.getGeneratedContent(page, 'linkedin');
    const twitterContent = await TestHelpers.getGeneratedContent(page, 'twitter');
    const instagramContent = await TestHelpers.getGeneratedContent(page, 'instagram');
    
    // Should contain casual language indicators
    const casualIndicators = ['!', '☕', 'coffee', 'cafe'];
    const hasCasualTone = casualIndicators.some(indicator => 
      linkedinContent.includes(indicator) || 
      twitterContent.includes(indicator) || 
      instagramContent.includes(indicator)
    );
    expect(hasCasualTone).toBe(true);
  });

  test('analytics dashboard functionality', async ({ page }) => {
    const testData = TestHelpers.getTestData().techStartup;
    
    // Generate content first
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    await TestHelpers.waitForContentGeneration(page);
    
    // Open analytics dashboard
    await TestHelpers.openAnalytics(page);
    
    // Check for analytics elements
    await expect(page.locator('.analytics-dashboard')).toBeVisible();
    await expect(page.locator('.average-score')).toBeVisible();
    await expect(page.locator('.best-platform')).toBeVisible();
    await expect(page.locator('.total-generations')).toBeVisible();
  });

  test('history functionality', async ({ page }) => {
    const testData = TestHelpers.getTestData().fashionBrand;
    
    // Generate content first
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    await TestHelpers.waitForContentGeneration(page);
    
    // Open history
    await TestHelpers.openHistory(page);
    
    // Check for history elements
    await expect(page.locator('.history-sidebar')).toBeVisible();
    await expect(page.locator('.history-item')).toBeVisible();
    
    // Click on history item to load previous generation
    await page.click('.history-item:first-child');
    await TestHelpers.waitForContentGeneration(page);
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
  });

  test('export functionality', async ({ page }) => {
    const testData = TestHelpers.getTestData().techStartup;
    
    // Generate content first
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    await TestHelpers.waitForContentGeneration(page);
    
    // Export results
    const download = await TestHelpers.exportResults(page);
    
    // Check download
    expect(download.suggestedFilename()).toMatch(/brandvoice-export/);
  });

  test('form reset functionality', async ({ page }) => {
    const testData = TestHelpers.getTestData().fashionBrand;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    await TestHelpers.waitForContentGeneration(page);
    
    // Verify content is generated
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
    
    // Reset form
    await TestHelpers.resetForm(page);
    
    // Verify form is cleared
    await expect(page.locator('input[name="companyName"]')).toHaveValue('');
    await expect(page.locator('select[name="industry"]')).toHaveValue('');
    await expect(page.locator('select[name="tone"]')).toHaveValue('');
    
    // Verify content is cleared
    expect(await page.locator('.linkedin-card').isVisible()).toBe(false);
    expect(await page.locator('.twitter-card').isVisible()).toBe(false);
    expect(await page.locator('.instagram-card').isVisible()).toBe(false);
  });

  test('error handling - API failure', async ({ page }) => {
    // Mock API error
    await TestHelpers.mockApiError(page, 500, 'Internal Server Error');
    
    const testData = TestHelpers.getTestData().techStartup;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    
    // Check for error message
    expect(await TestHelpers.hasError(page)).toBe(true);
    
    // Content should not be generated
    expect(await page.locator('.linkedin-card').isVisible()).toBe(false);
  });

  test('error handling - network timeout', async ({ page }) => {
    // Mock slow API response
    await page.route('**/functions/v1/generate-brand-content', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            linkedin: { content: 'Test content', charCount: 12, timestamp: new Date().toISOString() },
            twitter: { content: 'Test content', charCount: 12, timestamp: new Date().toISOString() },
            instagram: { content: 'Test content', charCount: 12, timestamp: new Date().toISOString() }
          })
        });
      }, 10000);
    });
    
    const testData = TestHelpers.getTestData().techStartup;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    
    // Should show loading state
    expect(await TestHelpers.isLoading(page)).toBe(true);
    
    // Wait for completion
    await TestHelpers.waitForContentGeneration(page);
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const testData = TestHelpers.getTestData().coffeeShop;
    
    // Fill form and generate content
    await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
    await TestHelpers.waitForContentGeneration(page);
    
    // Verify content is generated and visible on mobile
    expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
    
    // Check that form elements are accessible
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page.locator('select[name="industry"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Content")')).toBeVisible();
  });

  test('performance - multiple rapid generations', async ({ page }) => {
    const testData = TestHelpers.getTestData().techStartup;
    
    // Generate content multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await TestHelpers.generateContent(page, testData.brandProfile, testData.contentBrief);
      await TestHelpers.waitForContentGeneration(page);
      
      // Verify content is generated
      expect(await TestHelpers.areAllPlatformsVisible(page)).toBe(true);
      
      // Reset for next iteration
      await TestHelpers.resetForm(page);
    }
  });
});
