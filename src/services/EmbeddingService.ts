import OpenAI from 'openai';
import type { ServiceNowTicket } from '../types';

// Lazy-loaded ChromaDB - only import when needed
let ChromaClient: any = null;
let chromaClient: any = null;

const loadChroma = async () => {
  if (!ChromaClient) {
    const chromadb = await import('chromadb');
    ChromaClient = chromadb.ChromaClient;
    chromaClient = new ChromaClient();
  }
  return chromaClient;
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const COLLECTION_NAME = 'servicenow_tickets';

export class EmbeddingService {
  private collection: any = null;
  private chromaAvailable: boolean = false;

  async initialize() {
    try {
      const client = await loadChroma();
      this.collection = await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { description: 'ServiceNow tickets for similarity search' }
      });
      this.chromaAvailable = true;
    } catch (error) {
      console.warn('ChromaDB not available:', error);
      this.chromaAvailable = false;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed. Check your OpenAI API key.');
    }
  }

  async indexTicket(ticket: ServiceNowTicket) {
    const text = this.ticketToText(ticket);
    const embedding = await this.generateEmbedding(text);

    if (this.chromaAvailable && this.collection) {
      try {
        await this.collection.add({
          ids: [ticket.sys_id],
          embeddings: [embedding],
          documents: [text],
          metadatas: [{
            number: ticket.number,
            category: ticket.category,
            subcategory: ticket.subcategory,
            state: ticket.state,
            priority: ticket.priority,
            resolved_at: ticket.resolved_at || null
          }]
        });
      } catch (e) {
        console.warn('Failed to index ticket:', e);
      }
    }

    return embedding;
  }

  async searchSimilarTickets(
    ticket: ServiceNowTicket,
    topK: number = 5,
    minScore: number = 0.7
  ): Promise<Array<{
    ticketId: string;
    score: number;
    metadata: any;
  }>> {
    if (!this.chromaAvailable) {
      throw new Error('Vector database not available. ChromaDB server not running.');
    }

    const text = this.ticketToText(ticket);
    const embedding = await this.generateEmbedding(text);

    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    const results = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
      where: { resolved_at: { $ne: null } }
    });

    if (!results.ids[0]) return [];

    return results.ids[0]
      .map((id: string, index: number) => ({
        ticketId: id,
        score: results.distances[0][index],
        metadata: results.metadatas[0][index]
      }))
      .filter((r: any) => r.score >= minScore);
  }

  async semanticSearch(
    query: string,
    topK: number = 10
  ): Promise<Array<{
    ticketId: string;
    score: number;
    document: string;
    metadata: any;
  }>> {
    if (!this.chromaAvailable) {
      throw new Error('Vector database not available');
    }

    const embedding = await this.generateEmbedding(query);

    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    const results = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: topK
    });

    if (!results.ids[0]) return [];

    return results.ids[0].map((id: string, index: number) => ({
      ticketId: id,
      score: results.distances[0][index],
      document: results.documents[0][index],
      metadata: results.metadatas[0][index]
    }));
  }

  private ticketToText(ticket: ServiceNowTicket): string {
    return `
      Ticket: ${ticket.number}
      Category: ${ticket.category}
      Subcategory: ${ticket.subcategory}
      Priority: ${ticket.priority}
      Short Description: ${ticket.short_description}
      Description: ${ticket.description}
      Resolution: ${ticket.close_notes || ''}
    `.trim();
  }
}

export const embeddingService = new EmbeddingService();
