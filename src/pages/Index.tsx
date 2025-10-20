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
// import { useContentGenerator } from "@/hooks/useContentGenerator.js";
import { useContentGeneratorSupabase as useContentGenerator } from "@/hooks/useContentGeneratorSupabase.js";
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            BrandVoice - AI Content with Brand Consistency
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History ({generationHistory.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            {hasResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <Card className="mb-6 backdrop-blur-sm bg-card/80">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating content...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                {currentPlatform && (
                  <p className="text-sm text-muted-foreground">
                    Currently processing: <span className="font-medium capitalize">{currentPlatform}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && hasResults && (
          <Card className="mb-6 backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {getAverageScore() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getBestPlatform() || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Platform</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generationHistory.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Generations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Input Section */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Brand Profile</CardTitle>
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

            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Content Brief</CardTitle>
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

            <div className="flex gap-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="flex-1"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
              {canCancel && (
                <Button 
                  onClick={() => {/* Add cancel functionality */}} 
                  variant="destructive"
                  size="lg"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleReset} 
                variant="outline"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - Output Section */}
          <div className="space-y-6">
            {!generatedContent ? (
              <Card className="backdrop-blur-sm bg-card/80 border-dashed h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground py-20">
                  <p className="text-lg">Generated content will appear here</p>
                  <p className="text-sm mt-2">Fill in the form and click "Generate Content" to get started</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* LinkedIn Card */}
                <Card className="backdrop-blur-sm bg-card/80 border-blue-500/20">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-blue-500" />
                        LinkedIn
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {generatedContent.linkedin.brandVoiceScore && (
                          <Badge className={getScoreColor(generatedContent.linkedin.brandVoiceScore)}>
                            {generatedContent.linkedin.brandVoiceScore}/100 - {getScoreLabel(generatedContent.linkedin.brandVoiceScore)}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegeneratePlatform('linkedin')}
                          disabled={isGenerating}
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
