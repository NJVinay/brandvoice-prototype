/**
 * Test helper utilities for BrandVoice Playwright tests
 */

export class TestHelpers {
  /**
   * Fill the complete brand profile form
   */
  static async fillBrandProfile(page, profile) {
    await page.fill('input[name="companyName"]', profile.companyName || '');
    await page.selectOption('select[name="industry"]', profile.industry || 'Tech');
    await page.selectOption('select[name="tone"]', profile.tone || 'Professional');
    await page.fill('textarea[name="targetAudience"]', profile.targetAudience || '');
    await page.fill('textarea[name="examplePost1"]', profile.examplePost1 || '');
    await page.fill('textarea[name="examplePost2"]', profile.examplePost2 || '');
  }

  /**
   * Fill the content brief form
   */
  static async fillContentBrief(page, brief) {
    await page.fill('textarea[name="topic"]', brief.topic || '');
    await page.fill('input[name="cta"]', brief.cta || '');
    await page.fill('input[name="keywords"]', brief.keywords || '');
  }

  /**
   * Fill the complete form and generate content
   */
  static async generateContent(page, brandProfile, contentBrief) {
    await this.fillBrandProfile(page, brandProfile);
    await this.fillContentBrief(page, contentBrief);
    await page.click('button:has-text("Generate Content")');
  }

  /**
   * Wait for content generation to complete
   */
  static async waitForContentGeneration(page, timeout = 30000) {
    await page.waitForSelector('.linkedin-card', { timeout });
    await page.waitForSelector('.twitter-card', { timeout: 5000 });
    await page.waitForSelector('.instagram-card', { timeout: 5000 });
  }

  /**
   * Get brand voice score from a platform card
   */
  static async getBrandVoiceScore(page, platform) {
    const scoreElement = page.locator(`.${platform}-card .brand-voice-score`);
    await scoreElement.waitFor({ timeout: 10000 });
    const scoreText = await scoreElement.textContent();
    return parseInt(scoreText);
  }

  /**
   * Check if score is within expected range
   */
  static isScoreValid(score) {
    return score >= 60 && score <= 100;
  }

  /**
   * Get character count from a platform card
   */
  static async getCharacterCount(page, platform) {
    const countElement = page.locator(`.${platform}-card .char-count`);
    await countElement.waitFor({ timeout: 5000 });
    const countText = await countElement.textContent();
    return parseInt(countText);
  }

  /**
   * Copy content from a platform card
   */
  static async copyContent(page, platform) {
    await page.click(`.${platform}-card button:has-text("Copy")`);
  }

  /**
   * Regenerate content for a specific platform
   */
  static async regeneratePlatform(page, platform) {
    await page.click(`.${platform}-card button:has-text("Regenerate")`);
  }

  /**
   * Reset the entire form
   */
  static async resetForm(page) {
    await page.click('button:has-text("Reset")');
  }

  /**
   * Open analytics dashboard
   */
  static async openAnalytics(page) {
    await page.click('button:has-text("Analytics")');
    await page.waitForSelector('.analytics-dashboard', { timeout: 5000 });
  }

  /**
   * Open history sidebar
   */
  static async openHistory(page) {
    await page.click('button:has-text("History")');
    await page.waitForSelector('.history-sidebar', { timeout: 5000 });
  }

  /**
   * Export results
   */
  static async exportResults(page) {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    return await downloadPromise;
  }

  /**
   * Check if loading state is visible
   */
  static async isLoading(page) {
    return await page.locator('.loading, [data-loading="true"]').isVisible();
  }

  /**
   * Wait for loading to complete
   */
  static async waitForLoadingComplete(page, timeout = 30000) {
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('.loading, [data-loading="true"]');
      return loadingElements.length === 0;
    }, { timeout });
  }

  /**
   * Check if error message is visible
   */
  static async hasError(page) {
    return await page.locator('.toast-error, [role="alert"]').isVisible();
  }

  /**
   * Check if success message is visible
   */
  static async hasSuccess(page) {
    return await page.locator('.toast-success, [role="alert"]').isVisible();
  }

  /**
   * Get the generated content from a platform card
   */
  static async getGeneratedContent(page, platform) {
    const contentElement = page.locator(`.${platform}-card .generated-content`);
    await contentElement.waitFor({ timeout: 10000 });
    return await contentElement.textContent();
  }

  /**
   * Check if all platform cards are visible
   */
  static async areAllPlatformsVisible(page) {
    const linkedin = await page.locator('.linkedin-card').isVisible();
    const twitter = await page.locator('.twitter-card').isVisible();
    const instagram = await page.locator('.instagram-card').isVisible();
    return linkedin && twitter && instagram;
  }

  /**
   * Mock API response for testing
   */
  static async mockApiResponse(page, response) {
    await page.route('**/functions/v1/generate-brand-content', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Mock API error for testing
   */
  static async mockApiError(page, status = 500, message = 'API Error') {
    await page.route('**/functions/v1/generate-brand-content', route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: message })
      });
    });
  }

  /**
   * Test data for different scenarios
   */
  static getTestData() {
    return {
      fashionBrand: {
        brandProfile: {
          companyName: 'EcoThreads',
          industry: 'Fashion',
          tone: 'Inspiring',
          targetAudience: 'Eco-conscious millennials',
          examplePost1: 'Every thread tells a story of sustainability. Our new organic cotton collection isn\'t just fashion—it\'s a movement toward a greener future. 🌱✨',
          examplePost2: 'Fashion meets conscience. When you choose EcoThreads, you\'re not just buying clothes, you\'re investing in the planet. #SustainableFashion #EcoFriendly'
        },
        contentBrief: {
          topic: 'New organic cotton collection launch',
          cta: 'Shop the collection now',
          keywords: 'sustainable, organic, eco-friendly, fashion'
        }
      },
      techStartup: {
        brandProfile: {
          companyName: 'DevTools AI',
          industry: 'Tech',
          tone: 'Professional',
          targetAudience: 'Software developers and engineering managers',
          examplePost1: 'Revolutionizing code review with AI. Our platform catches bugs before they reach production, saving teams hours of debugging time.',
          examplePost2: 'The future of software development is here. DevTools AI analyzes your code in real-time, providing instant feedback and suggestions.'
        },
        contentBrief: {
          topic: 'AI-powered code review platform',
          cta: 'Start your free trial',
          keywords: 'AI, code review, developer tools, productivity'
        }
      },
      coffeeShop: {
        brandProfile: {
          companyName: 'Daily Grind Cafe',
          industry: 'Food',
          tone: 'Casual',
          targetAudience: 'Local community and coffee enthusiasts',
          examplePost1: 'Nothing beats the smell of freshly ground beans in the morning! Come in for our signature blend and start your day right. ☕',
          examplePost2: 'Coffee brings people together. Whether you\'re studying, working, or catching up with friends, Daily Grind is your perfect spot.'
        },
        contentBrief: {
          topic: 'Weekend special: new seasonal latte',
          cta: 'Visit us this weekend',
          keywords: 'coffee, seasonal, latte, weekend, local'
        }
      }
    };
  }
}
