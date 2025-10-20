import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, RefreshCw, Linkedin, Twitter, Instagram } from "lucide-react";
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
  linkedin: { content: string; hashtags: string[] };
  twitter: { content: string; hashtags: string[] };
  instagram: { content: string; hashtags: string[] };
}

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
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

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!brandProfile.companyName || !brandProfile.tone || !contentBrief.topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, brand tone, and topic at minimum.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandProfile, contentBrief }
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast({
        title: "Content Generated!",
        description: "Your brand-consistent content is ready.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    setGeneratedContent(null);
  };

  const getCharCount = (content: string, hashtags: string[]) => {
    const hashtagText = hashtags.map(tag => `#${tag}`).join(' ');
    return `${content} ${hashtagText}`.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          BrandVoice - AI Content with Brand Consistency
        </h1>

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
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
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
                    <CardTitle className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 text-blue-500" />
                      LinkedIn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.linkedin.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.linkedin.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-blue-500">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {getCharCount(generatedContent.linkedin.content, generatedContent.linkedin.hashtags)} characters
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
                    <CardTitle className="flex items-center gap-2">
                      <Twitter className="h-5 w-5" />
                      Twitter/X
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.twitter.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.twitter.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-primary">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {getCharCount(generatedContent.twitter.content, generatedContent.twitter.hashtags)} / 280 characters
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
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      Instagram
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <p className="whitespace-pre-wrap">{generatedContent.instagram.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.instagram.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-pink-500">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {getCharCount(generatedContent.instagram.content, generatedContent.instagram.hashtags)} characters
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
      </div>
    </div>
  );
};

export default Index;
