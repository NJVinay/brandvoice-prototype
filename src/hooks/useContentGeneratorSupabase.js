import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateBrandVoiceScore, analyzeBrandVoiceAlignment } from '../utils/brandVoiceScorer';

/**
 * Custom hook for managing content generation with Supabase Edge Function
 * Provides a clean interface for generating brand content with integrated scoring
 */
export function useContentGeneratorSupabase() {
  // Core state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Additional state for enhanced functionality
  const [generationHistory, setGenerationHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  
  // Refs for managing async operations
  const abortControllerRef = useRef(null);
  const generationIdRef = useRef(0);

  /**
   * Generate brand content for all platforms using Supabase Edge Function
   * @param {Object} brandProfile - Brand profile data
   * @param {Object} contentBrief - Content brief data
   * @param {Object} options - Additional options
   */
  const generate = useCallback(async (brandProfile, contentBrief, options = {}) => {
    const {
      includeScoring = true,
      saveToHistory = true,
      onProgress = null,
      onPlatformComplete = null
    } = options;

    // Prevent multiple simultaneous generations
    if (isGenerating) {
      console.warn('Content generation already in progress');
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const generationId = ++generationIdRef.current;
    
    setLoading(true);
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentPlatform(null);

    try {
      // Validate inputs
      validateInputs(brandProfile, contentBrief);

      // Simulate progress for better UX
      setProgress(20);
      setCurrentPlatform('linkedin');
      if (onProgress) onProgress({ platform: 'linkedin', progress: 20, completed: 0, total: 3 });

      // Call Supabase Edge Function
      const { data: generatedContent, error: supabaseError } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandProfile, contentBrief }
      });

      if (supabaseError) throw supabaseError;

      setProgress(60);
      setCurrentPlatform('twitter');
      if (onProgress) onProgress({ platform: 'twitter', progress: 60, completed: 1, total: 3 });

      // Process results with scoring if enabled
      const resultsWithScores = await processResultsWithScoring(
        generatedContent, 
        brandProfile, 
        contentBrief, 
        includeScoring,
        onProgress,
        onPlatformComplete,
        generationId
      );

      setProgress(100);
      setCurrentPlatform(null);

      // Update state with results
      setResults(resultsWithScores);
      
      // Save to history if enabled
      if (saveToHistory) {
        const historyEntry = {
          id: generationId,
          timestamp: new Date().toISOString(),
          brandProfile: { ...brandProfile },
          contentBrief: { ...contentBrief },
          results: resultsWithScores,
          options
        };
        
        setGenerationHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
      }

    } catch (err) {
      // Handle different types of errors
      if (err.name === 'AbortError') {
        console.log('Content generation cancelled');
        return;
      }
      
      const errorMessage = err.message || 'An unexpected error occurred during content generation';
      setError(errorMessage);
      console.error('Content generation error:', err);
      
      // Log error for debugging
      if (err.response) {
        console.error('API Error Response:', err.response.data);
      }
      
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setProgress(0);
      setCurrentPlatform(null);
      abortControllerRef.current = null;
    }
  }, [isGenerating]);

  /**
   * Process results and add brand voice scoring
   */
  const processResultsWithScoring = async (
    generatedContent, 
    brandProfile, 
    contentBrief, 
    includeScoring,
    onProgress,
    onPlatformComplete,
    generationId
  ) => {
    const platforms = Object.keys(generatedContent);
    const resultsWithScores = {};
    
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const data = generatedContent[platform];
      
      // Check if generation was cancelled
      if (generationId !== generationIdRef.current) {
        throw new Error('Generation cancelled');
      }
      
      setCurrentPlatform(platform);
      setProgress(60 + (i / platforms.length) * 40);
      
      if (onProgress) {
        onProgress({
          platform,
          progress: 60 + (i / platforms.length) * 40,
          completed: i + 1,
          total: platforms.length
        });
      }

      if (data.content && includeScoring) {
        try {
          // Calculate brand voice score
          const brandVoiceScore = calculateBrandVoiceScore(
            data.content, 
            brandProfile, 
            contentBrief
          );
          
          // Get detailed analysis
          const analysis = analyzeBrandVoiceAlignment(
            data.content, 
            brandProfile, 
            contentBrief
          );

          resultsWithScores[platform] = {
            ...data,
            brandVoiceScore: brandVoiceScore.overallScore,
            brandVoiceAnalysis: analysis,
            platform,
            generatedAt: new Date().toISOString()
          };
          
        } catch (scoringError) {
          console.warn(`Error calculating brand voice score for ${platform}:`, scoringError);
          resultsWithScores[platform] = {
            ...data,
            brandVoiceScore: null,
            brandVoiceAnalysis: null,
            platform,
            generatedAt: new Date().toISOString(),
            scoringError: scoringError.message
          };
        }
      } else {
        resultsWithScores[platform] = {
          ...data,
          platform,
          generatedAt: new Date().toISOString()
        };
      }

      if (onPlatformComplete) {
        onPlatformComplete({
          platform,
          result: resultsWithScores[platform],
          progress: 60 + ((i + 1) / platforms.length) * 40
        });
      }
    }
    
    return resultsWithScores;
  };

  /**
   * Generate content for a specific platform only
   */
  const generateForPlatform = useCallback(async (platform, brandProfile, contentBrief, options = {}) => {
    if (isGenerating) {
      console.warn('Content generation already in progress');
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    setError(null);
    setCurrentPlatform(platform);

    try {
      validateInputs(brandProfile, contentBrief);
      
      // Call Supabase Edge Function
      const { data: generatedContent, error: supabaseError } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandProfile, contentBrief }
      });

      if (supabaseError) throw supabaseError;

      const platformData = generatedContent[platform];
      
      if (platformData && platformData.content) {
        const brandVoiceScore = calculateBrandVoiceScore(
          platformData.content, 
          brandProfile, 
          contentBrief
        );
        
        const result = {
          ...platformData,
          brandVoiceScore: brandVoiceScore.overallScore,
          brandVoiceAnalysis: brandVoiceScore,
          platform,
          generatedAt: new Date().toISOString()
        };
        
        setResults({ [platform]: result });
      } else {
        setResults({ [platform]: platformData });
      }
      
    } catch (err) {
      setError(err.message);
      console.error(`Error generating content for ${platform}:`, err);
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setCurrentPlatform(null);
    }
  }, [isGenerating]);

  /**
   * Regenerate content for a specific platform
   */
  const regeneratePlatform = useCallback(async (platform, brandProfile, contentBrief, options = {}) => {
    if (!results || !results[platform]) {
      console.warn(`No existing content found for ${platform} to regenerate`);
      return;
    }

    const currentResults = { ...results };
    delete currentResults[platform];
    setResults(currentResults);

    await generateForPlatform(platform, brandProfile, contentBrief, options);
  }, [results, generateForPlatform]);

  /**
   * Cancel ongoing generation
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsGenerating(false);
    setProgress(0);
    setCurrentPlatform(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
    setCurrentPlatform(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear generation history
   */
  const clearHistory = useCallback(() => {
    setGenerationHistory([]);
  }, []);

  /**
   * Get results for a specific platform
   */
  const getPlatformResult = useCallback((platform) => {
    return results?.[platform] || null;
  }, [results]);

  /**
   * Get average brand voice score across all platforms
   */
  const getAverageScore = useCallback(() => {
    if (!results) return null;
    
    const scores = Object.values(results)
      .filter(result => result.brandVoiceScore !== null && result.brandVoiceScore !== undefined)
      .map(result => result.brandVoiceScore);
    
    if (scores.length === 0) return null;
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [results]);

  /**
   * Get the best performing platform based on brand voice score
   */
  const getBestPlatform = useCallback(() => {
    if (!results) return null;
    
    const platforms = Object.entries(results)
      .filter(([_, result]) => result.brandVoiceScore !== null && result.brandVoiceScore !== undefined)
      .sort(([_, a], [__, b]) => b.brandVoiceScore - a.brandVoiceScore);
    
    return platforms.length > 0 ? platforms[0][0] : null;
  }, [results]);

  /**
   * Export results as JSON
   */
  const exportResults = useCallback((format = 'json') => {
    if (!results) return null;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      results,
      averageScore: getAverageScore(),
      bestPlatform: getBestPlatform(),
      totalPlatforms: Object.keys(results).length
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  }, [results, getAverageScore, getBestPlatform]);

  /**
   * Validate input parameters
   */
  const validateInputs = (brandProfile, contentBrief) => {
    if (!brandProfile || !contentBrief) {
      throw new Error('Brand profile and content brief are required');
    }
    
    const requiredBrandFields = ['companyName', 'tone', 'industry'];
    const requiredBriefFields = ['topic'];
    
    for (const field of requiredBrandFields) {
      if (!brandProfile[field]) {
        throw new Error(`Missing required brand profile field: ${field}`);
      }
    }
    
    for (const field of requiredBriefFields) {
      if (!contentBrief[field]) {
        throw new Error(`Missing required content brief field: ${field}`);
      }
    }
  };

  return {
    // Core state
    loading,
    results,
    error,
    
    // Enhanced state
    isGenerating,
    progress,
    currentPlatform,
    generationHistory,
    
    // Core actions
    generate,
    reset,
    
    // Enhanced actions
    generateForPlatform,
    regeneratePlatform,
    cancelGeneration,
    clearHistory,
    
    // Utility functions
    getPlatformResult,
    getAverageScore,
    getBestPlatform,
    exportResults,
    
    // State queries
    hasResults: !!results,
    hasError: !!error,
    isGeneratingForPlatform: (platform) => currentPlatform === platform,
    canCancel: isGenerating && !!abortControllerRef.current
  };
}
