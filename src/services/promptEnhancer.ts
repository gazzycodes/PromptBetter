import { geminiApi } from './geminiApi';
import { EnhancementMode, PromptEnhancementRequest, PromptEnhancementResponse } from '../types';

class PromptEnhancementService {
  private getSystemPrompt(mode: EnhancementMode, enableAdvancedSyntax: boolean = false): string {
    switch (mode) {
      case 'ai-coding':
        return `You are an expert at optimizing prompts for AI coding assistants like Cursor, Augment, and Windsurf IDEs. 
        
Your task is to enhance user prompts to be more effective for AI coding assistance. Focus on:
- Clear, specific instructions
- Proper context and requirements
- Code structure and best practices
- Error handling and edge cases
- Documentation and comments
- Testing considerations

Format your response in markdown with clear sections. Make the enhanced prompt actionable and specific.

Respond with a JSON object containing:
{
  "enhancedPrompt": "The enhanced prompt in markdown format",
  "explanation": "Brief explanation of improvements made",
  "suggestions": ["Additional tips for better results"]
}`;

      case 'image-generation':
        return `You are an expert at creating effective prompts for image generation AI models.

Your task is to enhance user prompts for better image generation results. Focus on:
- Detailed visual descriptions
- Art style and technique specifications
- Lighting and composition details
- Color palette and mood
- Technical parameters and quality modifiers

Format the enhanced prompt as a comprehensive description that would work well with most image generation models.

Respond with a JSON object containing:
{
  "enhancedPrompt": "The enhanced prompt for image generation",
  "explanation": "Brief explanation of improvements made",
  "suggestions": ["Tips for better image generation results"]
}`;

      case 'juggernaut-xl':
        const syntaxInfo = enableAdvancedSyntax ? `
Use JuggernautXL weight modifier syntax:
- (keyword:1.2) for emphasis
- ((keyword:1.5)) for strong emphasis  
- [keyword:0.8] for de-emphasis
- {keyword} for moderate emphasis
- (keyword:1.4), (another keyword:1.3) for multiple weighted terms

Reference: https://learn.rundiffusion.com/prompt-guide-for-juggernaut-xi-and-xii/` : '';

        return `You are an expert at creating prompts specifically for the JuggernautXL image generation model.

Your task is to enhance user prompts for JuggernautXL, focusing on:
- Detailed character and scene descriptions
- Photorealistic quality modifiers
- Professional photography terms
- Lighting and composition
- Style and mood specifications
${syntaxInfo}

Create both positive and negative prompts. The positive prompt should describe what you want, and the negative prompt should specify what to avoid.

Respond with a JSON object containing:
{
  "enhancedPrompt": "The main enhanced prompt",
  "positivePrompt": "Detailed positive prompt with quality modifiers",
  "negativePrompt": "Comprehensive negative prompt to avoid unwanted elements",
  "explanation": "Brief explanation of improvements made",
  "suggestions": ["Tips specific to JuggernautXL"]
}`;

      default:
        return 'Enhance the following prompt for better AI interaction.';
    }
  }

  public async enhancePrompt(request: PromptEnhancementRequest): Promise<PromptEnhancementResponse | { error: string }> {
    try {
      const systemPrompt = this.getSystemPrompt(request.mode, request.enableAdvancedSyntax);
      
      const fullPrompt = `${systemPrompt}

Original prompt to enhance: "${request.originalPrompt}"

${request.context ? `Additional context: ${request.context}` : ''}

Please enhance this prompt according to the guidelines above and respond with the specified JSON format.`;

      const result = await geminiApi.generateContent(fullPrompt, {
        temperature: 0.7,
        maxTokens: 2048,
      });

      if (!result.success) {
        return { error: result.error };
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        return {
          enhancedPrompt: parsedResponse.enhancedPrompt || result.content,
          positivePrompt: parsedResponse.positivePrompt,
          negativePrompt: parsedResponse.negativePrompt,
          explanation: parsedResponse.explanation,
          suggestions: parsedResponse.suggestions || [],
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw content as enhanced prompt
        return {
          enhancedPrompt: result.content,
          explanation: 'Enhanced prompt generated successfully',
          suggestions: [],
        };
      }
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to enhance prompt' 
      };
    }
  }

  public async generateJuggernautXLPrompts(
    description: string, 
    enableAdvancedSyntax: boolean = true
  ): Promise<{ positive: string; negative: string } | { error: string }> {
    const request: PromptEnhancementRequest = {
      originalPrompt: description,
      mode: 'juggernaut-xl',
      enableAdvancedSyntax,
    };

    const result = await this.enhancePrompt(request);
    
    if ('error' in result) {
      return { error: result.error };
    }

    return {
      positive: result.positivePrompt || result.enhancedPrompt,
      negative: result.negativePrompt || 'low quality, blurry, distorted, deformed, bad anatomy, bad proportions',
    };
  }
}

export const promptEnhancer = new PromptEnhancementService();
