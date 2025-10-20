import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandProfile, contentBrief } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a professional social media content creator specializing in brand-consistent content. 
Analyze the brand profile and create platform-specific content that maintains brand voice and resonates with the target audience.

Brand Profile:
- Company: ${brandProfile.companyName}
- Industry: ${brandProfile.industry}
- Tone: ${brandProfile.tone}
- Target Audience: ${brandProfile.targetAudience}
- Example Posts: 
  1. ${brandProfile.examplePost1}
  2. ${brandProfile.examplePost2}

Content Brief:
- Topic: ${contentBrief.topic}
- Call-to-Action: ${contentBrief.cta}
- Keywords: ${contentBrief.keywords}

Create three distinct posts optimized for:
1. LinkedIn (professional, 200-300 words, industry insights)
2. Twitter/X (concise, under 280 characters, engaging)
3. Instagram (visual, emoji-rich, 150-200 words, relatable)

Return ONLY a valid JSON object with this exact structure:
{
  "linkedin": {
    "content": "post text here",
    "hashtags": ["tag1", "tag2", "tag3"]
  },
  "twitter": {
    "content": "post text here",
    "hashtags": ["tag1", "tag2"]
  },
  "instagram": {
    "content": "post text here",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the social media content now.' }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response from the AI
    const parsedContent = JSON.parse(content);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-brand-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
