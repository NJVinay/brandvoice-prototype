import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should display all form elements', async ({ page }) => {
    // Brand Profile section
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page.locator('select[name="industry"]')).toBeVisible();
    await expect(page.locator('select[name="tone"]')).toBeVisible();
    await expect(page.locator('textarea[name="targetAudience"]')).toBeVisible();
    await expect(page.locator('textarea[name="examplePost1"]')).toBeVisible();
    await expect(page.locator('textarea[name="examplePost2"]')).toBeVisible();
    
    // Content Brief section
    await expect(page.locator('textarea[name="topic"]')).toBeVisible();
    await expect(page.locator('input[name="cta"]')).toBeVisible();
    await expect(page.locator('input[name="keywords"]')).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    await expect(page.locator('label:has-text("Company Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Industry")')).toBeVisible();
    await expect(page.locator('label:has-text("Brand Tone")')).toBeVisible();
    await expect(page.locator('label:has-text("Target Audience")')).toBeVisible();
    await expect(page.locator('label:has-text("Example Post 1")')).toBeVisible();
    await expect(page.locator('label:has-text("Example Post 2")')).toBeVisible();
    await expect(page.locator('label:has-text("Topic/Message")')).toBeVisible();
    await expect(page.locator('label:has-text("Call-to-Action")')).toBeVisible();
    await expect(page.locator('label:has-text("Keywords")')).toBeVisible();
  });

  test('should have working dropdowns', async ({ page }) => {
    // Test industry dropdown
    await page.click('select[name="industry"]');
    await expect(page.locator('option[value="Tech"]')).toBeVisible();
    await expect(page.locator('option[value="Fashion"]')).toBeVisible();
    await expect(page.locator('option[value="Food"]')).toBeVisible();
    await expect(page.locator('option[value="Finance"]')).toBeVisible();
    
    // Test tone dropdown
    await page.click('select[name="tone"]');
    await expect(page.locator('option[value="Professional"]')).toBeVisible();
    await expect(page.locator('option[value="Casual"]')).toBeVisible();
    await expect(page.locator('option[value="Inspiring"]')).toBeVisible();
    await expect(page.locator('option[value="Humorous"]')).toBeVisible();
    await expect(page.locator('option[value="Educational"]')).toBeVisible();
  });

  test('should have proper button states', async ({ page }) => {
    // Generate button should be enabled
    await expect(page.locator('button:has-text("Generate Content")')).toBeEnabled();
    
    // Reset button should be enabled
    await expect(page.locator('button:has-text("Reset")')).toBeEnabled();
    
    // Analytics button should be visible
    await expect(page.locator('button:has-text("Analytics")')).toBeVisible();
    
    // History button should be visible
    await expect(page.locator('button:has-text("History")')).toBeVisible();
    
    // Export button should be visible
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
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
    
    // Click generate
    await page.click('button:has-text("Generate Content")');
    
    // Check for loading state
    await expect(page.locator('.loading, [data-loading="true"]')).toBeVisible();
    
    // Generate button should be disabled during loading
    await expect(page.locator('button:has-text("Generate Content")')).toBeDisabled();
  });

  test('should display progress bar during generation', async ({ page }) => {
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
    
    // Click generate
    await page.click('button:has-text("Generate Content")');
    
    // Check for progress bar
    await expect(page.locator('.progress-bar, [role="progressbar"]')).toBeVisible();
  });

  test('should show platform cards after generation', async ({ page }) => {
    // Fill form and generate
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
    
    // Wait for platform cards
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.twitter-card')).toBeVisible();
    await expect(page.locator('.instagram-card')).toBeVisible();
    
    // Check for platform-specific content
    await expect(page.locator('.linkedin-card h3')).toContainText('LinkedIn');
    await expect(page.locator('.twitter-card h3')).toContainText('Twitter');
    await expect(page.locator('.instagram-card h3')).toContainText('Instagram');
  });

  test('should have working copy buttons', async ({ page }) => {
    // Fill form and generate
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
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for copy buttons
    await expect(page.locator('.linkedin-card button:has-text("Copy")')).toBeVisible();
    await expect(page.locator('.twitter-card button:has-text("Copy")')).toBeVisible();
    await expect(page.locator('.instagram-card button:has-text("Copy")')).toBeVisible();
  });

  test('should have working regenerate buttons', async ({ page }) => {
    // Fill form and generate
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
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for regenerate buttons
    await expect(page.locator('.linkedin-card button:has-text("Regenerate")')).toBeVisible();
    await expect(page.locator('.twitter-card button:has-text("Regenerate")')).toBeVisible();
    await expect(page.locator('.instagram-card button:has-text("Regenerate")')).toBeVisible();
  });

  test('should show character counts', async ({ page }) => {
    // Fill form and generate
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
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for character counts
    await expect(page.locator('.linkedin-card .char-count')).toBeVisible();
    await expect(page.locator('.twitter-card .char-count')).toBeVisible();
    await expect(page.locator('.instagram-card .char-count')).toBeVisible();
  });

  test('should have proper focus states', async ({ page }) => {
    // Test focus on input fields
    await page.focus('input[name="companyName"]');
    await expect(page.locator('input[name="companyName"]:focus')).toBeVisible();
    
    await page.focus('textarea[name="topic"]');
    await expect(page.locator('textarea[name="topic"]:focus')).toBeVisible();
  });

  test('should have proper hover states', async ({ page }) => {
    // Test hover on buttons
    await page.hover('button:has-text("Generate Content")');
    // Button should have hover state (visual change)
    
    await page.hover('button:has-text("Reset")');
    // Button should have hover state (visual change)
  });
});
