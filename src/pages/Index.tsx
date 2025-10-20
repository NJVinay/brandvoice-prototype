import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useContentGeneratorSimple as useContentGenerator } from "@/hooks/useContentGeneratorSimple.js";
import { Loader2, Copy, RefreshCw, Linkedin, Twitter, Instagram, History, BarChart3, Download, RotateCcw, TrendingUp, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BrandProfile {
  companyName: string;
  industry: string;
  tone: string;
  targetAudience: string;
  examplePost1: string;
  examplePost2: string;
}

interface ContentBrief {
  topic: string;
  cta: string;
  keywords: string;
}

interface GeneratedContent {
  linkedin: { 
    content: string; 
    hashtags: string[];
    brandVoiceScore?: number;
    brandVoiceAnalysis?: any;
    charCount?: number;
    timestamp?: string;
  };
  twitter: { 
    content: string; 
    hashtags: string[];
    brandVoiceScore?: number;
    brandVoiceAnalysis?: any;
    charCount?: number;
    timestamp?: string;
  };
  instagram: { 
    content: string; 
    hashtags: string[];
    brandVoiceScore?: number;
    brandVoiceAnalysis?: any;
    charCount?: number;
    timestamp?: string;
  };
}

const Index = () => {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    companyName: "",
    industry: "",
    tone: "",
    targetAudience: "",
    examplePost1: "",
    examplePost2: "",
  });

  const [contentBrief, setContentBrief] = useState<ContentBrief>({
    topic: "",
    cta: "",
    keywords: "",
  });

  // Use the new content generator hook
  const {
    loading,
    results: generatedContent,
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
    hasResults,
    canCancel
  } = useContentGenerator();

  const handleGenerate = async () => {
    if (!brandProfile.companyName || !brandProfile.tone || !contentBrief.topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, brand tone, and topic at minimum.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generate(brandProfile, contentBrief, {
        includeScoring: true,
        saveToHistory: true,
        onProgress: (progressData) => {
          console.log(`Progress: ${progressData.progress}% - ${progressData.platform}`);
        },
        onPlatformComplete: (result) => {
          console.log(`Completed ${result.platform}:`, result.result);
        }
      });

      toast({
        title: "Content Generated!",
        description: "Your brand-consistent content is ready with scoring analysis.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error?.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${platform} content copied to clipboard.`,
    });
  };

  const handleReset = () => {
    setBrandProfile({
      companyName: "",
      industry: "",
      tone: "",
      targetAudience: "",
      examplePost1: "",
      examplePost2: "",
    });
    setContentBrief({
      topic: "",
      cta: "",
      keywords: "",
    });
    reset();
  };

  const handleRegeneratePlatform = async (platform: string) => {
    try {
      await regeneratePlatform(platform, brandProfile, contentBrief);
      toast({
        title: "Content Regenerated!",
        description: `${platform} content has been regenerated.`,
      });
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: `Failed to regenerate ${platform} content.`,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const exportData = exportResults('json');
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brandvoice-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete!",
        description: "Content and analytics exported successfully.",
      });
    }
  };

  const getCharCount = (content: string, hashtags: string[]) => {
    const hashtagText = hashtags.map(tag => `#${tag}`).join(' ');
    return `${content} ${hashtagText}`.length;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              BrandVoice
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
              AI-Powered Brand Content Generator
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Create consistent, engaging social media content that perfectly matches your brand voice across all platforms.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {generationHistory.length}
              </Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            {hasResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>

        {/* Modern Progress Bar */}
        {isGenerating && (
          <Card className="mb-8 backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Generating content...</p>
                      <p className="text-sm text-slate-500">
                        {currentPlatform ? `Processing ${currentPlatform}...` : 'Preparing your content'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-700">{Math.round(progress)}%</div>
                    <div className="text-xs text-slate-500">Complete</div>
                  </div>
                </div>
                <Progress value={progress} className="w-full h-3 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Analytics Dashboard */}
        {showAnalytics && hasResults && (
          <Card className="mb-8 backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {getAverageScore() || 0}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Average Score</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Brand Voice Quality</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="text-3xl font-bold text-green-600 mb-1 capitalize">
                    {getBestPlatform() || 'N/A'}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">Best Platform</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">Top Performer</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {generationHistory.length}
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Generations</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Content Created</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Input Section */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Brand Profile
                </CardTitle>
                <p className="text-sm text-slate-500">Tell us about your brand's personality and voice</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={brandProfile.companyName}
                    onChange={(e) => setBrandProfile({ ...brandProfile, companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={brandProfile.industry} onValueChange={(value) => setBrandProfile({ ...brandProfile, industry: value })}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Brand Tone *</Label>
                  <Select value={brandProfile.tone} onValueChange={(value) => setBrandProfile({ ...brandProfile, tone: value })}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Inspiring">Inspiring</SelectItem>
                      <SelectItem value="Humorous">Humorous</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={brandProfile.targetAudience}
                    onChange={(e) => setBrandProfile({ ...brandProfile, targetAudience: e.target.value })}
                    placeholder="e.g., Marketing professionals, Gen Z consumers"
                  />
                </div>

                <div>
                  <Label htmlFor="examplePost1">Example Post 1</Label>
                  <Textarea
                    id="examplePost1"
                    value={brandProfile.examplePost1}
                    onChange={(e) => setBrandProfile({ ...brandProfile, examplePost1: e.target.value })}
                    placeholder="Share an example of your brand's social media content..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="examplePost2">Example Post 2</Label>
                  <Textarea
                    id="examplePost2"
                    value={brandProfile.examplePost2}
                    onChange={(e) => setBrandProfile({ ...brandProfile, examplePost2: e.target.value })}
                    placeholder="Share another example..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Content Brief
                </CardTitle>
                <p className="text-sm text-slate-500">Describe what you want to communicate</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic/Message *</Label>
                  <Textarea
                    id="topic"
                    value={contentBrief.topic}
                    onChange={(e) => setContentBrief({ ...contentBrief, topic: e.target.value })}
                    placeholder="What do you want to communicate?"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="cta">Call-to-Action</Label>
                  <Input
                    id="cta"
                    value={contentBrief.cta}
                    onChange={(e) => setContentBrief({ ...contentBrief, cta: e.target.value })}
                    placeholder="e.g., Visit our website, Sign up now"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    value={contentBrief.keywords}
                    onChange={(e) => setContentBrief({ ...contentBrief, keywords: e.target.value })}
                    placeholder="innovation, technology, growth"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-5 w-5" />
                    Generate Content
                  </>
                )}
              </Button>
              {canCancel && (
                <Button 
                  onClick={() => {/* Add cancel functionality */}} 
                  variant="destructive"
                  size="lg"
                  className="h-12 px-6"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleReset} 
                variant="outline"
                size="lg"
                className="h-12 px-6 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - Output Section */}
          <div className="space-y-6">
            {!generatedContent ? (
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl border-dashed h-full flex items-center justify-center">
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                    <Target className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Generate Content</h3>
                  <p className="text-slate-500 mb-4">Fill in your brand profile and content brief, then click "Generate Content" to create AI-powered social media posts that match your brand voice.</p>
                  <div className="flex justify-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 rounded-full">LinkedIn</span>
                    <span className="px-2 py-1 bg-slate-100 rounded-full">Twitter</span>
                    <span className="px-2 py-1 bg-slate-100 rounded-full">Instagram</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* LinkedIn Card */}
                <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl border-l-4 border-l-blue-500">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                          <Linkedin className="h-4 w-4 text-white" />
                        </div>
                        LinkedIn
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {generatedContent.linkedin.brandVoiceScore && (
                          <Badge className={`${getScoreColor(generatedContent.linkedin.brandVoiceScore)} font-semibold px-3 py-1`}>
                            {generatedContent.linkedin.brandVoiceScore}/100
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegeneratePlatform('linkedin')}
                          disabled={isGenerating}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.linkedin.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.linkedin.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-blue-500">#{tag}</span>
                      ))}
                    </div>
                    
                    {/* Brand Voice Analysis */}
                    {generatedContent.linkedin.brandVoiceAnalysis && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Brand Voice Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tone: {generatedContent.linkedin.brandVoiceAnalysis.breakdown?.toneAlignment || 0}/30</div>
                          <div>Keywords: {generatedContent.linkedin.brandVoiceAnalysis.breakdown?.keywordInclusion || 0}/25</div>
                          <div>Length: {generatedContent.linkedin.brandVoiceAnalysis.breakdown?.lengthAppropriateness || 0}/15</div>
                          <div>Hashtags: {generatedContent.linkedin.brandVoiceAnalysis.breakdown?.hashtagPresence || 0}/10</div>
                        </div>
                        {generatedContent.linkedin.brandVoiceAnalysis.suggestions && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              💡 {generatedContent.linkedin.brandVoiceAnalysis.suggestions[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {generatedContent.linkedin.charCount || getCharCount(generatedContent.linkedin.content, generatedContent.linkedin.hashtags)} characters
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(
                          `${generatedContent.linkedin.content}\n\n${generatedContent.linkedin.hashtags.map(t => `#${t}`).join(' ')}`,
                          "LinkedIn"
                        )}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter Card */}
                <Card className="backdrop-blur-sm bg-card/80 border-foreground/20">
                  <CardHeader className="bg-gradient-to-r from-foreground/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Twitter className="h-5 w-5" />
                        Twitter/X
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {generatedContent.twitter.brandVoiceScore && (
                          <Badge className={getScoreColor(generatedContent.twitter.brandVoiceScore)}>
                            {generatedContent.twitter.brandVoiceScore}/100 - {getScoreLabel(generatedContent.twitter.brandVoiceScore)}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegeneratePlatform('twitter')}
                          disabled={isGenerating}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.twitter.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.twitter.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-primary">#{tag}</span>
                      ))}
                    </div>
                    
                    {/* Brand Voice Analysis */}
                    {generatedContent.twitter.brandVoiceAnalysis && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Brand Voice Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tone: {generatedContent.twitter.brandVoiceAnalysis.breakdown?.toneAlignment || 0}/30</div>
                          <div>Keywords: {generatedContent.twitter.brandVoiceAnalysis.breakdown?.keywordInclusion || 0}/25</div>
                          <div>Length: {generatedContent.twitter.brandVoiceAnalysis.breakdown?.lengthAppropriateness || 0}/15</div>
                          <div>Hashtags: {generatedContent.twitter.brandVoiceAnalysis.breakdown?.hashtagPresence || 0}/10</div>
                        </div>
                        {generatedContent.twitter.brandVoiceAnalysis.suggestions && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              💡 {generatedContent.twitter.brandVoiceAnalysis.suggestions[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {generatedContent.twitter.charCount || getCharCount(generatedContent.twitter.content, generatedContent.twitter.hashtags)} / 280 characters
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(
                          `${generatedContent.twitter.content}\n\n${generatedContent.twitter.hashtags.map(t => `#${t}`).join(' ')}`,
                          "Twitter"
                        )}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Instagram Card */}
                <Card className="backdrop-blur-sm bg-card/80 border-pink-500/20">
                  <CardHeader className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-pink-500" />
                        Instagram
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {generatedContent.instagram.brandVoiceScore && (
                          <Badge className={getScoreColor(generatedContent.instagram.brandVoiceScore)}>
                            {generatedContent.instagram.brandVoiceScore}/100 - {getScoreLabel(generatedContent.instagram.brandVoiceScore)}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegeneratePlatform('instagram')}
                          disabled={isGenerating}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.instagram.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.instagram.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-pink-500">#{tag}</span>
                      ))}
                    </div>
                    
                    {/* Brand Voice Analysis */}
                    {generatedContent.instagram.brandVoiceAnalysis && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Brand Voice Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tone: {generatedContent.instagram.brandVoiceAnalysis.breakdown?.toneAlignment || 0}/30</div>
                          <div>Keywords: {generatedContent.instagram.brandVoiceAnalysis.breakdown?.keywordInclusion || 0}/25</div>
                          <div>Length: {generatedContent.instagram.brandVoiceAnalysis.breakdown?.lengthAppropriateness || 0}/15</div>
                          <div>Hashtags: {generatedContent.instagram.brandVoiceAnalysis.breakdown?.hashtagPresence || 0}/10</div>
                        </div>
                        {generatedContent.instagram.brandVoiceAnalysis.suggestions && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              💡 {generatedContent.instagram.brandVoiceAnalysis.suggestions[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {generatedContent.instagram.charCount || getCharCount(generatedContent.instagram.content, generatedContent.instagram.hashtags)} characters
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(
                          `${generatedContent.instagram.content}\n\n${generatedContent.instagram.hashtags.map(t => `#${t}`).join(' ')}`,
                          "Instagram"
                        )}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Generation History Sidebar */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-96 bg-background border-l shadow-xl">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Generation History</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(false)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
                {generationHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No generation history yet
                  </p>
                ) : (
                  generationHistory.map((entry, index) => (
                    <Card key={entry.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{entry.brandProfile.companyName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.results ? Object.keys(entry.results).length : 0} platforms
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.contentBrief.topic}
                        </p>
                        {entry.results && (
                          <div className="flex gap-1">
                            {Object.entries(entry.results).map(([platform, result]) => (
                              <Badge
                                key={platform}
                                variant="secondary"
                                className="text-xs"
                              >
                                {platform}: {result.brandVoiceScore || 'N/A'}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setBrandProfile(entry.brandProfile);
                            setContentBrief(entry.contentBrief);
                            setShowHistory(false);
                          }}
                        >
                          Load This Generation
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
