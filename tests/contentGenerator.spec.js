import { test, expect } from '@playwright/test';

test.describe('BrandVoice Content Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should load the application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('BrandVoice');
  });

  test('should show validation error for empty form', async ({ page }) => {
    await page.click('button:has-text("Generate Content")');
    // Check for toast notification or error state
    await expect(page.locator('.toast-error, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('should generate content for all platforms', async ({ page }) => {
    // Fill brand profile
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    
    // Fill content brief
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    // Generate
    await page.click('button:has-text("Generate Content")');
    
    // Wait for results
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.twitter-card')).toBeVisible();
    await expect(page.locator('.instagram-card')).toBeVisible();
  });

  test('should copy content to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Fill form and generate content
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content to generate
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Click copy button
    await page.click('.linkedin-card button:has-text("Copy")');
    
    // Verify toast notification
    await expect(page.locator('.toast-success, [role="alert"]')).toBeVisible();
  });

  test('should show brand voice scoring', async ({ page }) => {
    // Fill form and generate content
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content to generate
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for brand voice score
    await expect(page.locator('.brand-voice-score')).toBeVisible();
  });

  test('should reset form and results', async ({ page }) => {
    // Fill form
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    
    // Generate content
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Reset
    await page.click('button:has-text("Reset")');
    
    // Verify form is cleared
    await expect(page.locator('input[name="companyName"]')).toHaveValue('');
    await expect(page.locator('.linkedin-card')).not.toBeVisible();
  });

  test('should show loading state during generation', async ({ page }) => {
    // Fill form
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    // Click generate and check for loading state
    await page.click('button:has-text("Generate Content")');
    
    // Check for loading indicator
    await expect(page.locator('.loading, [data-loading="true"]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/functions/v1/generate-brand-content', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      });
    });
    
    // Fill form
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    // Generate
    await page.click('button:has-text("Generate Content")');
    
    // Check for error message
    await expect(page.locator('.toast-error, [role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile layout is applied
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if form is accessible on mobile
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page.locator('select[name="industry"]')).toBeVisible();
  });

  test('should show analytics dashboard', async ({ page }) => {
    // Fill form and generate content
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Click analytics button
    await page.click('button:has-text("Analytics")');
    
    // Check for analytics dashboard
    await expect(page.locator('.analytics-dashboard')).toBeVisible();
  });

  test('should export results', async ({ page }) => {
    // Fill form and generate content
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Developers');
    await page.fill('textarea[name="examplePost1"]', 'Example post 1');
    await page.fill('textarea[name="examplePost2"]', 'Example post 2');
    await page.fill('textarea[name="topic"]', 'AI productivity tools');
    await page.fill('input[name="cta"]', 'Learn more');
    await page.fill('input[name="keywords"]', 'AI, productivity, developer');
    
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Check for download
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });
});
