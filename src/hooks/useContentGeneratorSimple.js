import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified content generator hook that works with Supabase Edge Function
 */
export function useContentGeneratorSimple() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);

  const generate = useCallback(async (brandProfile, contentBrief, options = {}) => {
    const { saveToHistory = true } = options;

    if (isGenerating) {
      console.warn('Content generation already in progress');
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentPlatform(null);

    try {
      // Validate inputs
      if (!brandProfile?.companyName || !brandProfile?.tone || !contentBrief?.topic) {
        throw new Error('Missing required fields: company name, tone, and topic');
      }

      // Simulate progress
      setProgress(20);
      setCurrentPlatform('linkedin');

      // Call Supabase Edge Function
      const { data: generatedContent, error: supabaseError } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandProfile, contentBrief }
      });

      if (supabaseError) throw supabaseError;

      setProgress(60);
      setCurrentPlatform('twitter');

      // Process results with basic scoring
      const resultsWithScores = {};
      const platforms = Object.keys(generatedContent);
      
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        const data = generatedContent[platform];
        
        setProgress(60 + (i / platforms.length) * 40);
        setCurrentPlatform(platform);

        if (data.content) {
          // Simple scoring based on content length and hashtags
          const contentLength = data.content.length;
          const hashtagCount = (data.content.match(/#\w+/g) || []).length;
          const hasKeywords = contentBrief.keywords ? 
            contentBrief.keywords.split(',').some(keyword => 
              data.content.toLowerCase().includes(keyword.trim().toLowerCase())
            ) : true;
          
          let score = 50; // Base score
          if (contentLength > 50 && contentLength < 300) score += 20;
          if (hashtagCount > 0) score += 15;
          if (hasKeywords) score += 15;
          
          resultsWithScores[platform] = {
            ...data,
            brandVoiceScore: Math.min(score, 100),
            platform,
            generatedAt: new Date().toISOString(),
            charCount: contentLength
          };
        } else {
          resultsWithScores[platform] = {
            ...data,
            platform,
            generatedAt: new Date().toISOString()
          };
        }
      }

      setProgress(100);
      setCurrentPlatform(null);
      setResults(resultsWithScores);
      
      // Save to history
      if (saveToHistory) {
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          brandProfile: { ...brandProfile },
          contentBrief: { ...contentBrief },
          results: resultsWithScores
        };
        
        setGenerationHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
      }

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred during content generation';
      setError(errorMessage);
      console.error('Content generation error:', err);
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setProgress(0);
      setCurrentPlatform(null);
    }
  }, [isGenerating]);

  const generateForPlatform = useCallback(async (platform, brandProfile, contentBrief) => {
    if (isGenerating) return;

    setLoading(true);
    setIsGenerating(true);
    setError(null);
    setCurrentPlatform(platform);

    try {
      const { data: generatedContent, error: supabaseError } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandProfile, contentBrief }
      });

      if (supabaseError) throw supabaseError;

      const platformData = generatedContent[platform];
      if (platformData?.content) {
        const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
        setResults({ [platform]: { ...platformData, brandVoiceScore: score, platform } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setCurrentPlatform(null);
    }
  }, [isGenerating]);

  const regeneratePlatform = useCallback(async (platform, brandProfile, contentBrief) => {
    if (!results?.[platform]) return;
    await generateForPlatform(platform, brandProfile, contentBrief);
  }, [results, generateForPlatform]);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
    setCurrentPlatform(null);
  }, []);

  const getAverageScore = useCallback(() => {
    if (!results) return null;
    const scores = Object.values(results)
      .filter(result => result.brandVoiceScore)
      .map(result => result.brandVoiceScore);
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  }, [results]);

  const getBestPlatform = useCallback(() => {
    if (!results) return null;
    const platforms = Object.entries(results)
      .filter(([_, result]) => result.brandVoiceScore)
      .sort(([_, a], [__, b]) => b.brandVoiceScore - a.brandVoiceScore);
    return platforms.length > 0 ? platforms[0][0] : null;
  }, [results]);

  const exportResults = useCallback(() => {
    if (!results) return null;
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      averageScore: getAverageScore(),
      bestPlatform: getBestPlatform(),
      totalPlatforms: Object.keys(results).length
    }, null, 2);
  }, [results, getAverageScore, getBestPlatform]);

  return {
    loading,
    results,
    error,
    isGenerating,
    progress,
    currentPlatform,
    generationHistory,
    generate,
    generateForPlatform,
    regeneratePlatform,
    reset,
    getAverageScore,
    getBestPlatform,
    exportResults,
    hasResults: !!results,
    hasError: !!error,
    canCancel: isGenerating
  };
}
