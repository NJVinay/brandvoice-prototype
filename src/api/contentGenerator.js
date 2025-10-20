import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For demo only
});

// Request queue to manage rate limits
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 3; // Limit concurrent requests
    this.activeRequests = 0;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.activeRequests >= this.maxConcurrent) return;
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { request, resolve, reject } = this.queue.shift();
      this.activeRequests++;
      
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.activeRequests--;
      }
    }
    
    this.processing = false;
  }
}

// Cache for storing generated content
class ContentCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum cache entries
    this.ttl = 30 * 60 * 1000; // 30 minutes TTL
  }

  generateKey(brandProfile, contentBrief, platform) {
    return JSON.stringify({
      brandProfile: {
        companyName: brandProfile.companyName,
        industry: brandProfile.industry,
        tone: brandProfile.tone,
        targetAudience: brandProfile.targetAudience,
        examplePost1: brandProfile.examplePost1,
        examplePost2: brandProfile.examplePost2
      },
      contentBrief: {
        topic: contentBrief.topic,
        cta: contentBrief.cta,
        keywords: contentBrief.keywords
      },
      platform
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Logger utility
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    
    // In production, you might want to send logs to a service
    // this.sendToLogService(logEntry);
  }

  static info(message, data = null) {
    this.log('info', message, data);
  }

  static error(message, error = null) {
    this.log('error', message, error);
  }

  static warn(message, data = null) {
    this.log('warn', message, data);
  }

  static debug(message, data = null) {
    this.log('debug', message, data);
  }
}

// Retry utility with exponential backoff
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403 || error.status === 429 === false) {
        Logger.error(`Non-retryable error on attempt ${attempt + 1}:`, error);
        throw error;
      }
      
      if (attempt === maxRetries) {
        Logger.error(`Max retries (${maxRetries}) exceeded:`, error);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      Logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Initialize instances
const requestQueue = new RequestQueue();
const contentCache = new ContentCache();

// Main content generation function
export async function generateBrandContent(brandProfile, contentBrief) {
  Logger.info('Starting brand content generation', { 
    companyName: brandProfile.companyName,
    topic: contentBrief.topic 
  });

  const platforms = ['linkedin', 'twitter', 'instagram'];
  const results = {};
  const startTime = Date.now();

  try {
    // Validate inputs
    validateInputs(brandProfile, contentBrief);

    // Process all platforms in parallel with queue management
    const platformPromises = platforms.map(platform => 
      generatePlatformContent(brandProfile, contentBrief, platform)
    );

    const platformResults = await Promise.allSettled(platformPromises);

    // Process results
    platforms.forEach((platform, index) => {
      const result = platformResults[index];
      
      if (result.status === 'fulfilled') {
        results[platform] = result.value;
        Logger.info(`Successfully generated ${platform} content`, {
          charCount: result.value.charCount,
          timestamp: result.value.timestamp
        });
      } else {
        results[platform] = {
          error: result.reason.message,
          content: null,
          timestamp: new Date().toISOString()
        };
        Logger.error(`Failed to generate ${platform} content:`, result.reason);
      }
    });

    const totalTime = Date.now() - startTime;
    Logger.info('Brand content generation completed', { 
      totalTime: `${totalTime}ms`,
      successCount: Object.values(results).filter(r => !r.error).length,
      totalPlatforms: platforms.length
    });

    return results;

  } catch (error) {
    Logger.error('Critical error in generateBrandContent:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

// Generate content for a specific platform
async function generatePlatformContent(brandProfile, contentBrief, platform) {
  const cacheKey = contentCache.generateKey(brandProfile, contentBrief, platform);
  
  // Check cache first
  const cachedResult = contentCache.get(cacheKey);
  if (cachedResult) {
    Logger.debug(`Using cached content for ${platform}`);
    return cachedResult;
  }

  Logger.debug(`Generating new content for ${platform}`);

  // Queue the request to manage rate limits
  return requestQueue.add(async () => {
    const prompt = buildPlatformPrompt(brandProfile, contentBrief, platform);
    
    const response = await withRetry(async () => {
      Logger.debug(`Making OpenAI API call for ${platform}`);
      
      return await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert social media content creator who maintains consistent brand voice across platforms."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
    }, 3, 1000);

    const result = {
      content: response.choices[0].message.content,
      charCount: response.choices[0].message.content.length,
      timestamp: new Date().toISOString(),
      platform,
      model: 'gpt-3.5-turbo'
    };

    // Cache the result
    contentCache.set(cacheKey, result);
    
    Logger.info(`Successfully generated ${platform} content`, {
      charCount: result.charCount,
      tokensUsed: response.usage?.total_tokens || 'unknown'
    });

    return result;
  });
}

// Build platform-specific prompts
function buildPlatformPrompt(brandProfile, contentBrief, platform) {
  const platformConfigs = {
    linkedin: {
      maxLength: 200,
      format: 'Professional post with paragraph breaks',
      tone: 'thought-leadership and informative',
      hashtagCount: 3,
      emojiLevel: 'minimal or none'
    },
    twitter: {
      maxLength: 280,
      format: 'Single concise message',
      tone: 'punchy and impactful',
      hashtagCount: 2,
      emojiLevel: 'strategic use'
    },
    instagram: {
      maxLength: 150,
      format: 'Engaging caption with line breaks',
      tone: 'visual-first and engaging',
      hashtagCount: 7,
      emojiLevel: 'generous use'
    }
  };

  const config = platformConfigs[platform];

  return `
You are creating a ${platform.toUpperCase()} post for ${brandProfile.companyName}.

BRAND PROFILE:
- Industry: ${brandProfile.industry}
- Brand Tone: ${brandProfile.tone}
- Target Audience: ${brandProfile.targetAudience}

BRAND VOICE EXAMPLES (match this style):
"${brandProfile.examplePost1}"
"${brandProfile.examplePost2}"

CONTENT BRIEF:
- Topic/Message: ${contentBrief.topic}
- Call-to-Action: ${contentBrief.cta}
- Keywords to include: ${contentBrief.keywords}

${platform.toUpperCase()} REQUIREMENTS:
- Maximum length: ${config.maxLength} ${platform === 'twitter' ? 'characters' : 'words'}
- Format: ${config.format}
- Tone adaptation: ${config.tone} while maintaining brand voice
- Include ${config.hashtagCount} relevant hashtags
- Emoji usage: ${config.emojiLevel}

CRITICAL: The post must sound like it's from ${brandProfile.companyName} and match the brand voice shown in the examples, while following ${platform} best practices.

Generate the post now:
`.trim();
}

// Input validation
function validateInputs(brandProfile, contentBrief) {
  const requiredBrandFields = ['companyName', 'industry', 'tone', 'targetAudience', 'examplePost1', 'examplePost2'];
  const requiredBriefFields = ['topic', 'cta', 'keywords'];

  // Validate brand profile
  for (const field of requiredBrandFields) {
    if (!brandProfile[field] || brandProfile[field].trim() === '') {
      throw new Error(`Missing required brand profile field: ${field}`);
    }
  }

  // Validate content brief
  for (const field of requiredBriefFields) {
    if (!contentBrief[field] || contentBrief[field].trim() === '') {
      throw new Error(`Missing required content brief field: ${field}`);
    }
  }

  Logger.debug('Input validation passed');
}

// Utility functions for cache management
export function clearCache() {
  contentCache.cache.clear();
  Logger.info('Content cache cleared');
}

export function getCacheStats() {
  return {
    size: contentCache.cache.size,
    maxSize: contentCache.maxSize,
    ttl: contentCache.ttl
  };
}

// Export logger for external use
export { Logger };
