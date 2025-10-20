/**
 * Brand Voice Scoring System
 * Provides heuristic-based scoring for brand voice consistency
 */

// Enhanced tone keyword mapping with more comprehensive coverage
const TONE_KEYWORDS = {
  professional: [
    'insights', 'strategies', 'expertise', 'solutions', 'industry', 'analysis',
    'implementation', 'methodology', 'framework', 'optimization', 'efficiency',
    'performance', 'metrics', 'data-driven', 'best practices', 'leverage',
    'stakeholders', 'initiatives', 'deliverables', 'benchmark'
  ],
  casual: [
    'hey', 'awesome', 'cool', 'love', 'check out', 'amazing', 'incredible',
    'fantastic', 'brilliant', 'super', 'totally', 'definitely', 'absolutely',
    'rock', 'crush', 'nailed', 'killed', 'slayed', 'fire', 'lit'
  ],
  inspiring: [
    'journey', 'transform', 'empower', 'achieve', 'believe', 'dream', 'vision',
    'breakthrough', 'revolutionary', 'breakthrough', 'unleash', 'potential',
    'possibilities', 'opportunity', 'growth', 'success', 'triumph', 'victory',
    'overcome', 'challenge', 'adversity', 'resilience', 'determination'
  ],
  humorous: [
    '😂', 'lol', 'haha', 'funny', 'joke', 'hilarious', 'comedy', 'laugh',
    'chuckle', 'giggle', 'rofl', 'lmao', 'puns', 'wit', 'sarcasm', 'irony',
    'satire', 'meme', 'viral', 'trending', 'epic', 'legendary'
  ],
  educational: [
    'learn', 'discover', 'understand', 'tips', 'guide', 'tutorial', 'how-to',
    'explanation', 'breakdown', 'insights', 'knowledge', 'wisdom', 'teach',
    'explore', 'investigate', 'research', 'study', 'analysis', 'breakdown',
    'step-by-step', 'walkthrough', 'demonstration'
  ],
  conversational: [
    'you', 'your', 'we', 'us', 'our', 'let\'s', 'together', 'share', 'discuss',
    'talk', 'chat', 'connect', 'engage', 'interact', 'collaborate', 'join',
    'participate', 'involve', 'include', 'community', 'team', 'group'
  ],
  authoritative: [
    'proven', 'established', 'leading', 'premier', 'expert', 'specialist',
    'master', 'guru', 'pioneer', 'innovator', 'trailblazer', 'groundbreaking',
    'cutting-edge', 'state-of-the-art', 'advanced', 'sophisticated', 'elite',
    'premium', 'flagship', 'signature'
  ]
};

// Brand voice consistency patterns
const BRAND_VOICE_PATTERNS = {
  // Check for consistent use of first person (we/our) vs second person (you/your)
  perspective: {
    firstPerson: ['we', 'our', 'us', 'our team', 'our company'],
    secondPerson: ['you', 'your', 'your business', 'your team']
  },
  
  // Check for brand-specific language patterns
  brandLanguage: {
    technical: ['api', 'integration', 'platform', 'system', 'architecture', 'infrastructure'],
    creative: ['design', 'visual', 'aesthetic', 'artistic', 'creative', 'innovative'],
    business: ['revenue', 'roi', 'profit', 'growth', 'scalability', 'efficiency']
  }
};

/**
 * Calculate brand voice consistency score for generated content
 * @param {string} generatedPost - The generated social media post
 * @param {Object} brandProfile - Brand profile containing tone, keywords, etc.
 * @param {Object} contentBrief - Content brief with additional context
 * @returns {Object} Detailed scoring breakdown and overall score
 */
export function calculateBrandVoiceScore(generatedPost, brandProfile, contentBrief = {}) {
  if (!generatedPost || !brandProfile) {
    return {
      overallScore: 0,
      breakdown: {
        toneAlignment: 0,
        keywordInclusion: 0,
        lengthAppropriateness: 0,
        hashtagPresence: 0,
        brandConsistency: 0,
        callToAction: 0
      },
      suggestions: ['Missing required parameters for scoring']
    };
  }

  const post = generatedPost.toLowerCase();
  const breakdown = {};

  // 1. Tone Alignment Scoring (30 points max)
  breakdown.toneAlignment = calculateToneAlignmentScore(post, brandProfile.tone);

  // 2. Keyword Inclusion Scoring (25 points max)
  breakdown.keywordInclusion = calculateKeywordInclusionScore(post, brandProfile, contentBrief);

  // 3. Length Appropriateness (15 points max)
  breakdown.lengthAppropriateness = calculateLengthScore(generatedPost, brandProfile.platform);

  // 4. Hashtag Presence (10 points max)
  breakdown.hashtagPresence = calculateHashtagScore(generatedPost, brandProfile.platform);

  // 5. Brand Consistency (15 points max)
  breakdown.brandConsistency = calculateBrandConsistencyScore(post, brandProfile);

  // 6. Call-to-Action Presence (5 points max)
  breakdown.callToAction = calculateCTAScore(post, contentBrief.cta);

  // Calculate overall score
  const overallScore = Math.min(
    Object.values(breakdown).reduce((sum, score) => sum + score, 0),
    100
  );

  // Generate improvement suggestions
  const suggestions = generateSuggestions(breakdown, brandProfile, contentBrief);

  return {
    overallScore: Math.round(overallScore),
    breakdown,
    suggestions,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate tone alignment score based on keyword matching
 */
function calculateToneAlignmentScore(post, brandTone) {
  if (!brandTone) return 0;

  const tone = brandTone.toLowerCase();
  const relevantKeywords = TONE_KEYWORDS[tone] || [];
  
  if (relevantKeywords.length === 0) return 15; // Default score if tone not recognized

  const matchCount = relevantKeywords.filter(keyword => 
    post.includes(keyword.toLowerCase())
  ).length;

  // Calculate score based on keyword density
  const keywordDensity = matchCount / relevantKeywords.length;
  const baseScore = Math.min(matchCount * 2, 20); // 2 points per keyword, max 20
  const densityBonus = keywordDensity > 0.1 ? 10 : 0; // Bonus for good density

  return Math.min(baseScore + densityBonus, 30);
}

/**
 * Calculate keyword inclusion score
 */
function calculateKeywordInclusionScore(post, brandProfile, contentBrief) {
  const keywords = [];
  
  // Add brand profile keywords
  if (brandProfile.keywords) {
    keywords.push(...brandProfile.keywords.split(',').map(k => k.trim().toLowerCase()));
  }
  
  // Add content brief keywords
  if (contentBrief.keywords) {
    keywords.push(...contentBrief.keywords.split(',').map(k => k.trim().toLowerCase()));
  }

  if (keywords.length === 0) return 15; // Default score if no keywords

  const keywordMatches = keywords.filter(keyword => 
    post.includes(keyword.toLowerCase())
  ).length;

  const inclusionRate = keywordMatches / keywords.length;
  
  // Score based on inclusion rate
  if (inclusionRate >= 0.8) return 25;
  if (inclusionRate >= 0.6) return 20;
  if (inclusionRate >= 0.4) return 15;
  if (inclusionRate >= 0.2) return 10;
  return 5;
}

/**
 * Calculate length appropriateness score
 */
function calculateLengthScore(post, platform) {
  const length = post.length;
  
  const platformLimits = {
    linkedin: { min: 50, max: 200, ideal: { min: 100, max: 150 } },
    twitter: { min: 20, max: 280, ideal: { min: 100, max: 200 } },
    instagram: { min: 30, max: 150, ideal: { min: 80, max: 120 } },
    facebook: { min: 40, max: 250, ideal: { min: 100, max: 180 } }
  };

  const limits = platformLimits[platform?.toLowerCase()] || platformLimits.linkedin;

  // Check if within acceptable range
  if (length < limits.min || length > limits.max) return 5;

  // Check if within ideal range
  if (length >= limits.ideal.min && length <= limits.ideal.max) return 15;

  // Partial score for being close to ideal
  const distanceFromIdeal = Math.min(
    Math.abs(length - limits.ideal.min),
    Math.abs(length - limits.ideal.max)
  );
  
  return Math.max(10 - Math.floor(distanceFromIdeal / 10), 8);
}

/**
 * Calculate hashtag presence score
 */
function calculateHashtagScore(post, platform) {
  const hashtagCount = (post.match(/#\w+/g) || []).length;
  
  const platformHashtagExpectations = {
    linkedin: { min: 1, max: 5, ideal: 3 },
    twitter: { min: 1, max: 3, ideal: 2 },
    instagram: { min: 5, max: 15, ideal: 8 },
    facebook: { min: 0, max: 3, ideal: 1 }
  };

  const expectations = platformHashtagExpectations[platform?.toLowerCase()] || platformHashtagExpectations.linkedin;

  if (hashtagCount === 0) return expectations.min === 0 ? 5 : 0;
  if (hashtagCount >= expectations.min && hashtagCount <= expectations.max) return 10;
  if (hashtagCount === expectations.ideal) return 10;

  // Partial score based on how close to ideal
  const distanceFromIdeal = Math.abs(hashtagCount - expectations.ideal);
  return Math.max(5 - distanceFromIdeal, 0);
}

/**
 * Calculate brand consistency score
 */
function calculateBrandConsistencyScore(post, brandProfile) {
  let score = 0;

  // Check for brand name mention
  if (brandProfile.companyName && post.includes(brandProfile.companyName.toLowerCase())) {
    score += 5;
  }

  // Check for consistent perspective (first person vs second person)
  const firstPersonCount = BRAND_VOICE_PATTERNS.perspective.firstPerson.filter(
    word => post.includes(word)
  ).length;
  const secondPersonCount = BRAND_VOICE_PATTERNS.perspective.secondPerson.filter(
    word => post.includes(word)
  ).length;

  // Prefer consistent perspective
  if (firstPersonCount > 0 && secondPersonCount === 0) score += 5;
  else if (secondPersonCount > 0 && firstPersonCount === 0) score += 5;
  else if (firstPersonCount > 0 || secondPersonCount > 0) score += 3;

  // Check for industry-appropriate language
  if (brandProfile.industry) {
    const industryKeywords = BRAND_VOICE_PATTERNS.brandLanguage[brandProfile.industry.toLowerCase()] || [];
    const industryMatches = industryKeywords.filter(keyword => 
      post.includes(keyword.toLowerCase())
    ).length;
    
    if (industryMatches > 0) score += 5;
  }

  return Math.min(score, 15);
}

/**
 * Calculate call-to-action score
 */
function calculateCTAScore(post, cta) {
  if (!cta) return 5; // Default score if no CTA specified

  const ctaKeywords = ['learn more', 'discover', 'explore', 'get started', 'try', 'sign up', 'download', 'visit', 'click', 'check out'];
  
  const hasExplicitCTA = ctaKeywords.some(keyword => 
    post.includes(keyword.toLowerCase())
  );

  const hasQuestionCTA = post.includes('?');
  const hasActionWords = ['now', 'today', 'immediately', 'start', 'begin'].some(word => 
    post.includes(word)
  );

  if (hasExplicitCTA) return 5;
  if (hasQuestionCTA || hasActionWords) return 3;
  return 1;
}

/**
 * Generate improvement suggestions based on scoring breakdown
 */
function generateSuggestions(breakdown, brandProfile, contentBrief) {
  const suggestions = [];

  if (breakdown.toneAlignment < 20) {
    const tone = brandProfile.tone?.toLowerCase();
    const keywords = TONE_KEYWORDS[tone] || [];
    suggestions.push(`Improve tone alignment by including more ${tone} language. Consider using words like: ${keywords.slice(0, 5).join(', ')}`);
  }

  if (breakdown.keywordInclusion < 15) {
    const keywords = [
      ...(brandProfile.keywords?.split(',') || []),
      ...(contentBrief.keywords?.split(',') || [])
    ].map(k => k.trim()).filter(k => k);
    
    if (keywords.length > 0) {
      suggestions.push(`Include more relevant keywords: ${keywords.slice(0, 3).join(', ')}`);
    }
  }

  if (breakdown.lengthAppropriateness < 10) {
    const platform = brandProfile.platform || 'LinkedIn';
    suggestions.push(`Adjust post length for ${platform}. Consider making it shorter or longer based on platform best practices.`);
  }

  if (breakdown.hashtagPresence < 5) {
    const platform = brandProfile.platform || 'LinkedIn';
    const expectedCount = platform.toLowerCase() === 'instagram' ? '5-15' : 
                         platform.toLowerCase() === 'twitter' ? '1-3' : '2-5';
    suggestions.push(`Add more hashtags for ${platform} (recommended: ${expectedCount} hashtags)`);
  }

  if (breakdown.brandConsistency < 10) {
    suggestions.push('Strengthen brand consistency by mentioning your company name and maintaining a consistent voice throughout.');
  }

  if (breakdown.callToAction < 3) {
    suggestions.push('Add a clear call-to-action to encourage engagement (e.g., "Learn more", "Try now", "Discover how")');
  }

  if (suggestions.length === 0) {
    suggestions.push('Great job! Your content aligns well with the brand voice. Keep up the excellent work!');
  }

  return suggestions;
}

/**
 * Get detailed analysis of a post's brand voice alignment
 */
export function analyzeBrandVoiceAlignment(generatedPost, brandProfile, contentBrief = {}) {
  const score = calculateBrandVoiceScore(generatedPost, brandProfile, contentBrief);
  
  return {
    ...score,
    analysis: {
      strengths: getStrengths(score.breakdown),
      weaknesses: getWeaknesses(score.breakdown),
      recommendations: score.suggestions
    }
  };
}

function getStrengths(breakdown) {
  const strengths = [];
  
  if (breakdown.toneAlignment >= 25) strengths.push('Excellent tone alignment');
  if (breakdown.keywordInclusion >= 20) strengths.push('Great keyword integration');
  if (breakdown.lengthAppropriateness >= 12) strengths.push('Perfect length for platform');
  if (breakdown.hashtagPresence >= 8) strengths.push('Good hashtag usage');
  if (breakdown.brandConsistency >= 12) strengths.push('Strong brand consistency');
  if (breakdown.callToAction >= 4) strengths.push('Clear call-to-action');
  
  return strengths;
}

function getWeaknesses(breakdown) {
  const weaknesses = [];
  
  if (breakdown.toneAlignment < 15) weaknesses.push('Tone alignment needs improvement');
  if (breakdown.keywordInclusion < 10) weaknesses.push('Missing key keywords');
  if (breakdown.lengthAppropriateness < 8) weaknesses.push('Length not optimal for platform');
  if (breakdown.hashtagPresence < 5) weaknesses.push('Insufficient hashtag usage');
  if (breakdown.brandConsistency < 8) weaknesses.push('Brand consistency could be stronger');
  if (breakdown.callToAction < 2) weaknesses.push('Call-to-action is weak or missing');
  
  return weaknesses;
}

/**
 * Batch score multiple posts
 */
export function batchScorePosts(posts, brandProfile, contentBrief = {}) {
  return posts.map((post, index) => ({
    index,
    post,
    score: calculateBrandVoiceScore(post, brandProfile, contentBrief)
  }));
}

/**
 * Get average score across multiple posts
 */
export function getAverageBrandVoiceScore(posts, brandProfile, contentBrief = {}) {
  const scores = posts.map(post => 
    calculateBrandVoiceScore(post, brandProfile, contentBrief).overallScore
  );
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  return {
    averageScore: Math.round(average),
    individualScores: scores,
    totalPosts: posts.length,
    highPerformingPosts: scores.filter(score => score >= 80).length,
    needsImprovement: scores.filter(score => score < 60).length
  };
}
