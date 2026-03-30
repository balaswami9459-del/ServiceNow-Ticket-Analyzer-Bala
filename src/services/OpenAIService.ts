import OpenAI from 'openai';
import { ServiceNowTicket } from '../types';

class OpenAIService {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, LLM calls should go through a backend
      });
      this.isConfigured = true;
    }
  }

  async analyzeTicket(ticket: ServiceNowTicket): Promise<string> {
    if (!this.isConfigured || !this.openai) {
      return "OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.";
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert IT Service Management (ITSM) assistant. Analyze the provided ServiceNow ticket and provide a concise summary, potential root causes, and recommended next steps."
          },
          {
            role: "user",
            content: `Ticket Number: ${ticket.number}
Short Description: ${ticket.short_description}
Description: ${ticket.description}
Category: ${ticket.category}
Priority: ${ticket.priority}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || "No analysis generated.";
    } catch (error: any) {
      console.error('Error calling OpenAI:', error);
      if (error.status === 429) {
        return "AI Insight Unavailable: Your OpenAI account has exceeded its quota or has no billing credits. Please check your plan at platform.openai.com/account/billing.";
      }
      return `Error analyzing ticket with AI: ${error.message}`;
    }
  }

  async suggestResolution(ticket: ServiceNowTicket, similarTickets: ServiceNowTicket[]): Promise<string> {
    if (!this.isConfigured || !this.openai) {
      return "OpenAI API key not configured.";
    }

    const similarContext = similarTickets.map(t => 
      `Similar Ticket ${t.number}: ${t.short_description}\nResolution: ${t.close_notes}`
    ).join('\n\n');

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert ITSM assistant. Based on the current ticket and historical similar tickets, suggest a specific resolution or troubleshooting plan."
          },
          {
            role: "user",
            content: `Current Ticket:
${ticket.short_description}
${ticket.description}

Historical Similar Tickets:
${similarContext}

Provide a recommended resolution based on this data.`
          }
        ],
        temperature: 0.3
      });

      return response.choices[0]?.message?.content || "No suggestion generated.";
    } catch (error: any) {
      console.error('Error calling OpenAI:', error);
      return `Error generating suggestion: ${error.message}`;
    }
  }

  getCheckStatus(): boolean {
    return this.isConfigured;
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
