import OpenAI from 'openai';
import type { ServiceNowTicket } from '../types';

// Lazy initialization - only create client when needed
let openai: OpenAI | null = null;

const getOpenAI = () => {
  if (!openai) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
    }
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  return openai;
};

export interface AIAnalysisResult {
  classification: {
    category: string;
    subcategory: string;
    priority: string;
    confidence: number;
  };
  suggestedResolution: string;
  recommendedActions: string[];
  estimatedResolutionTime: string;
  similarPatterns: string[];
  escalationRecommended: boolean;
  reasoning: string;
}

export class AIAgentService {
  async analyzeTicket(
    ticket: ServiceNowTicket,
    similarTickets?: ServiceNowTicket[]
  ): Promise<AIAnalysisResult> {
    const client = getOpenAI();
    
    const similarTicketsContext = similarTickets && similarTickets.length > 0
      ? similarTickets.map(t => `
        Ticket ${t.number}:
        - Issue: ${t.short_description}
        - Resolution: ${t.close_notes || 'Not documented'}
        - Priority: ${t.priority}
        - State: ${t.state}
      `).join('\n')
      : 'No similar resolved tickets found.';

    const prompt = `
      You are an expert IT support analyst for a healthcare organization. Analyze this ServiceNow ticket and provide structured insights.

      CURRENT TICKET:
      Number: ${ticket.number}
      Category: ${ticket.category}
      Subcategory: ${ticket.subcategory}
      Priority: ${ticket.priority}
      Short Description: ${ticket.short_description}
      Description: ${ticket.description}
      Caller: ${ticket.caller_name}
      Urgency: ${ticket.urgency}
      Impact: ${ticket.impact}

      SIMILAR RESOLVED TICKETS:
      ${similarTicketsContext}

      Analyze this ticket and provide a JSON response with these fields:
      {
        "classification": {
          "category": "suggested category",
          "subcategory": "suggested subcategory", 
          "priority": "1-5 (1=Critical, 5=Planning)",
          "confidence": 0-1 score
        },
        "suggestedResolution": "step-by-step resolution guidance",
        "recommendedActions": ["action 1", "action 2", "action 3"],
        "estimatedResolutionTime": "time estimate (e.g., '2 hours', '1 day')",
        "similarPatterns": ["pattern 1", "pattern 2"],
        "escalationRecommended": true/false,
        "reasoning": "brief explanation of your analysis"
      }

      Important:
      - Base suggestions on similar ticket resolutions when available
      - Consider healthcare context (HIPAA, patient safety, system availability)
      - Recommend escalation for Critical/High priority or patient safety issues
      - Provide specific, actionable steps
    `;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise IT support analyst. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }

      return JSON.parse(content) as AIAnalysisResult;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('AI analysis failed. Check your OpenAI API key.');
    }
  }

  async generateResponseDraft(
    ticket: ServiceNowTicket,
    context: string,
    tone: 'professional' | 'empathetic' | 'technical' = 'professional'
  ): Promise<string> {
    const client = getOpenAI();
    
    const prompt = `
      Draft a customer-facing response for this ServiceNow ticket.
      
      Ticket: ${ticket.number}
      Description: ${ticket.short_description}
      ${ticket.description}
      
      Context: ${context}
      
      Tone: ${tone}
      
      Write a clear, helpful response that:
      - Acknowledges the issue
      - Explains what we're doing (or have done)
      - Sets expectations for next steps
      - Includes relevant details without being overly technical
    `;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional IT support communicator. Write clear, helpful responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      });

      return response.choices[0].message.content || 'Unable to generate response draft.';
    } catch (error) {
      console.error('Response generation failed:', error);
      throw new Error('Failed to generate response draft.');
    }
  }

  async summarizeTicket(ticket: ServiceNowTicket): Promise<{
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    const client = getOpenAI();
    
    const prompt = `
      Summarize this ServiceNow ticket concisely.
      
      Ticket ${ticket.number}:
      ${ticket.short_description}
      ${ticket.description}
      ${ticket.work_notes || ''}
      ${ticket.close_notes || ''}
      
      Provide a JSON response:
      {
        "summary": "2-3 sentence summary",
        "keyPoints": ["point 1", "point 2", "point 3"],
        "sentiment": "positive/neutral/negative"
      }
    `;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize tickets concisely. Return JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Summarization failed:', error);
      return {
        summary: ticket.short_description,
        keyPoints: [],
        sentiment: 'neutral'
      };
    }
  }
}

export const aiAgentService = new AIAgentService();
