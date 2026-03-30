import axios, { AxiosInstance } from 'axios';
import {
  ServiceNowTicket,
  TicketFilters,
  CreateTicketRequest,
  UpdateTicketRequest,
  ServiceNowConfig
} from '../types';

class ServiceNowClient {
  private client: AxiosInstance;

  constructor(_config: ServiceNowConfig) {
    this.client = axios.create({
      baseURL: `${_config.instanceUrl}/api/now/table`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: {
        username: _config.username,
        password: _config.password
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.error?.message || error.message;
          
          if (status === 401) {
            throw new Error('Authentication failed. Please check your credentials.');
          } else if (status === 403) {
            throw new Error('Access denied. Please check your permissions.');
          } else if (status === 404) {
            throw new Error('Ticket not found.');
          } else if (status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          } else {
            throw new Error(`ServiceNow API error: ${message}`);
          }
        }
        throw error;
      }
    );
  }

  // Get tickets with filters
  async getTickets(filters: TicketFilters = {}): Promise<{ tickets: ServiceNowTicket[]; total: number }> {
    const params: Record<string, string | number> = {
      sysparm_display_value: 'all',
      sysparm_exclude_reference_link: 'true',
      sysparm_limit: filters.limit || 50,
      sysparm_offset: filters.offset || 0,
      sysparm_orderby_desc: 'sys_updated_on'
    };

    // Build query string
    const queryParts: string[] = [];
    
    if (filters.state) {
      queryParts.push(`state=${filters.state}`);
    }
    if (filters.priority) {
      queryParts.push(`priority=${filters.priority}`);
    }
    if (filters.assigned_to) {
      queryParts.push(`assigned_to=${filters.assigned_to}`);
    }
    if (filters.caller_id) {
      queryParts.push(`caller_id=${filters.caller_id}`);
    }
    if (filters.category) {
      queryParts.push(`category=${filters.category}`);
    }
    if (filters.search) {
      queryParts.push(
        `short_descriptionLIKE${filters.search}^ORdescriptionLIKE${filters.search}^ORnumberLIKE${filters.search}`
      );
    }

    if (queryParts.length > 0) {
      params.sysparm_query = queryParts.join('^');
    }

    const response = await this.client.get('/incident', { params });
    
    // Get total count
    const countParams: Record<string, any> = { ...params, sysparm_count: 'true' };
    delete countParams.sysparm_limit;
    delete countParams.sysparm_offset;
    
    const countResponse = await this.client.get('/incident', { 
      params: countParams,
      headers: { 'X-No-Response-Body': 'true' }
    });
    
    const total = parseInt(countResponse.headers['x-total-count'] || '0', 10);

    return {
      tickets: this.parseTickets(response.data.result),
      total
    };
  }

  // Get single ticket by ID
  async getTicket(sysId: string): Promise<ServiceNowTicket> {
    const response = await this.client.get(`/incident/${sysId}`, {
      params: {
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true'
      }
    });

    return this.parseTicket(response.data.result);
  }

  // Get ticket by number
  async getTicketByNumber(number: string): Promise<ServiceNowTicket | null> {
    const response = await this.client.get('/incident', {
      params: {
        sysparm_query: `number=${number}`,
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true',
        sysparm_limit: 1
      }
    });

    const results = response.data.result;
    if (results.length === 0) {
      return null;
    }

    return this.parseTicket(results[0]);
  }

  // Create new ticket
  async createTicket(ticket: CreateTicketRequest): Promise<ServiceNowTicket> {
    const response = await this.client.post('/incident', ticket, {
      params: {
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true'
      }
    });

    return this.parseTicket(response.data.result);
  }

  // Update ticket
  async updateTicket(sysId: string, updates: UpdateTicketRequest): Promise<ServiceNowTicket> {
    const response = await this.client.patch(`/incident/${sysId}`, updates, {
      params: {
        sysparm_display_value: 'all',
        sysparm_exclude_reference_link: 'true'
      }
    });

    return this.parseTicket(response.data.result);
  }

  // Delete ticket
  async deleteTicket(sysId: string): Promise<void> {
    await this.client.delete(`/incident/${sysId}`);
  }

  // Get ticket statistics
  async getTicketStats(): Promise<{
    total: number;
    byState: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const states = ['1', '2', '3', '6', '7', '8'];
    const priorities = ['1', '2', '3', '4', '5'];
    
    const byState: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    // Get count for each state
    for (const state of states) {
      const response = await this.client.get('/incident', {
        params: {
          sysparm_query: `state=${state}`,
          sysparm_count: 'true'
        },
        headers: { 'X-No-Response-Body': 'true' }
      });
      byState[state] = parseInt(response.headers['x-total-count'] || '0', 10);
    }

    // Get count for each priority
    for (const priority of priorities) {
      const response = await this.client.get('/incident', {
        params: {
          sysparm_query: `priority=${priority}`,
          sysparm_count: 'true'
        },
        headers: { 'X-No-Response-Body': 'true' }
      });
      byPriority[priority] = parseInt(response.headers['x-total-count'] || '0', 10);
    }

    const total = Object.values(byState).reduce((sum, count) => sum + count, 0);

    return { total, byState, byPriority };
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/incident', {
        params: { sysparm_limit: 1, sysparm_count: 'true' },
        headers: { 'X-No-Response-Body': 'true' }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper method to parse a single ticket
  private parseTicket(data: any): ServiceNowTicket {
    return {
      sys_id: data.sys_id,
      number: data.number,
      short_description: data.short_description,
      description: data.description,
      state: data.state,
      priority: data.priority,
      urgency: data.urgency,
      impact: data.impact,
      category: data.category,
      subcategory: data.subcategory,
      caller_id: data.caller_id?.value || data.caller_id,
      caller_name: data.caller_id?.display_value,
      assigned_to: data.assigned_to?.value || data.assigned_to,
      assigned_to_name: data.assigned_to?.display_value,
      assignment_group: data.assignment_group?.value || data.assignment_group,
      assignment_group_name: data.assignment_group?.display_value,
      opened_at: data.opened_at,
      opened_by: data.opened_by?.value || data.opened_by,
      resolved_at: data.resolved_at,
      closed_at: data.closed_at,
      close_code: data.close_code,
      close_notes: data.close_notes,
      sys_created_on: data.sys_created_on,
      sys_updated_on: data.sys_updated_on,
      sys_updated_by: data.sys_updated_by
    };
  }

  // Helper method to parse multiple tickets
  private parseTickets(data: any[]): ServiceNowTicket[] {
    return data.map(ticket => this.parseTicket(ticket));
  }
}

// Create singleton instance
let clientInstance: ServiceNowClient | null = null;

export const initializeClient = (config: ServiceNowConfig): ServiceNowClient => {
  clientInstance = new ServiceNowClient(config);
  return clientInstance;
};

export const getClient = (): ServiceNowClient => {
  if (!clientInstance) {
    throw new Error('ServiceNow client not initialized. Please configure connection first.');
  }
  return clientInstance;
};

export const isClientInitialized = (): boolean => {
  return clientInstance !== null;
};

export default ServiceNowClient;
