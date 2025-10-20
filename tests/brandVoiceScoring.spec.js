import { test, expect } from '@playwright/test';

test.describe('Brand Voice Scoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should display brand voice scores for all platforms', async ({ page }) => {
    // Fill form with professional tone
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Revolutionizing software development with cutting-edge AI solutions.');
    await page.fill('textarea[name="examplePost2"]', 'Our platform delivers enterprise-grade performance and reliability.');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Start your free trial');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    
    // Wait for content to generate
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for brand voice scores
    await expect(page.locator('.linkedin-card .brand-voice-score')).toBeVisible();
    await expect(page.locator('.twitter-card .brand-voice-score')).toBeVisible();
    await expect(page.locator('.instagram-card .brand-voice-score')).toBeVisible();
    
    // Verify score values are within expected range (60-100)
    const linkedinScore = await page.locator('.linkedin-card .brand-voice-score').textContent();
    const twitterScore = await page.locator('.twitter-card .brand-voice-score').textContent();
    const instagramScore = await page.locator('.instagram-card .brand-voice-score').textContent();
    
    expect(parseInt(linkedinScore)).toBeGreaterThanOrEqual(60);
    expect(parseInt(linkedinScore)).toBeLessThanOrEqual(100);
    expect(parseInt(twitterScore)).toBeGreaterThanOrEqual(60);
    expect(parseInt(twitterScore)).toBeLessThanOrEqual(100);
    expect(parseInt(instagramScore)).toBeGreaterThanOrEqual(60);
    expect(parseInt(instagramScore)).toBeLessThanOrEqual(100);
  });

  test('should show different scores for different tones', async ({ page }) => {
    // Test professional tone
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Revolutionizing software development with cutting-edge AI solutions.');
    await page.fill('textarea[name="examplePost2"]', 'Our platform delivers enterprise-grade performance and reliability.');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Start your free trial');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    const professionalScore = await page.locator('.linkedin-card .brand-voice-score').textContent();
    
    // Reset and test casual tone
    await page.click('button:has-text("Reset")');
    
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Casual');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Hey devs! Check out our awesome new AI tool! 🚀');
    await page.fill('textarea[name="examplePost2"]', 'This is going to be a game-changer for your workflow!');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Try it out');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    const casualScore = await page.locator('.linkedin-card .brand-voice-score').textContent();
    
    // Scores should be different for different tones
    expect(professionalScore).not.toBe(casualScore);
  });

  test('should show brand voice analysis breakdown', async ({ page }) => {
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Revolutionizing software development with cutting-edge AI solutions.');
    await page.fill('textarea[name="examplePost2"]', 'Our platform delivers enterprise-grade performance and reliability.');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Start your free trial');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for analysis breakdown
    await expect(page.locator('.brand-voice-analysis')).toBeVisible();
    await expect(page.locator('.brand-voice-analysis .tone-alignment')).toBeVisible();
    await expect(page.locator('.brand-voice-analysis .keyword-inclusion')).toBeVisible();
    await expect(page.locator('.brand-voice-analysis .length-appropriateness')).toBeVisible();
  });

  test('should show improvement suggestions', async ({ page }) => {
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Revolutionizing software development with cutting-edge AI solutions.');
    await page.fill('textarea[name="examplePost2"]', 'Our platform delivers enterprise-grade performance and reliability.');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Start your free trial');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for improvement suggestions
    await expect(page.locator('.improvement-suggestions')).toBeVisible();
    await expect(page.locator('.improvement-suggestions li')).toHaveCount.greaterThan(0);
  });

  test('should show score color coding', async ({ page }) => {
    await page.fill('input[name="companyName"]', 'TechCorp');
    await page.selectOption('select[name="industry"]', 'Tech');
    await page.selectOption('select[name="tone"]', 'Professional');
    await page.fill('textarea[name="targetAudience"]', 'Software developers');
    await page.fill('textarea[name="examplePost1"]', 'Revolutionizing software development with cutting-edge AI solutions.');
    await page.fill('textarea[name="examplePost2"]', 'Our platform delivers enterprise-grade performance and reliability.');
    await page.fill('textarea[name="topic"]', 'AI-powered development tools');
    await page.fill('input[name="cta"]', 'Start your free trial');
    await page.fill('input[name="keywords"]', 'AI, development, software, productivity');
    
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.linkedin-card')).toBeVisible({ timeout: 30000 });
    
    // Check for score color coding
    const scoreElement = page.locator('.linkedin-card .brand-voice-score');
    await expect(scoreElement).toBeVisible();
    
    // Check if score has appropriate color class
    const classList = await scoreElement.getAttribute('class');
    expect(classList).toMatch(/score-(excellent|good|fair|poor)/);
  });
});
