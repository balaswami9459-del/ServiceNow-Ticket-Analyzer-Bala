export interface ServiceNowTicket {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  urgency: string;
  impact: string;
  category: string;
  subcategory: string;
  caller_id: string;
  caller_name?: string;
  assigned_to: string;
  assigned_to_name?: string;
  assignment_group: string;
  assignment_group_name?: string;
  opened_at: string;
  opened_by: string;
  resolved_at?: string;
  closed_at?: string;
  close_code?: string;
  close_notes?: string;
  work_notes?: string;
  sys_created_on: string;
  sys_updated_on: string;
  sys_updated_by: string;
}

export interface TicketFilters {
  state?: string;
  priority?: string;
  assigned_to?: string;
  caller_id?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTicketRequest {
  short_description: string;
  description: string;
  caller_id: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  urgency?: string;
  impact?: string;
  assignment_group?: string;
  assigned_to?: string;
}

export interface UpdateTicketRequest {
  short_description?: string;
  description?: string;
  state?: string;
  priority?: string;
  urgency?: string;
  impact?: string;
  assigned_to?: string;
  assignment_group?: string;
  close_code?: string;
  close_notes?: string;
  work_notes?: string;
}

export interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
}

export type TicketState = 
  | '1' // New
  | '2' // In Progress
  | '3' // On Hold
  | '6' // Resolved
  | '7' // Closed
  | '8' // Cancelled;

export const TicketStateLabels: Record<string, string> = {
  '1': 'New',
  '2': 'In Progress',
  '3': 'On Hold',
  '6': 'Resolved',
  '7': 'Closed',
  '8': 'Cancelled'
};

export const PriorityLabels: Record<string, string> = {
  '1': 'Critical',
  '2': 'High',
  '3': 'Moderate',
  '4': 'Low',
  '5': 'Planning'
};

export const PriorityColors: Record<string, string> = {
  '1': 'bg-red-100 text-red-800',
  '2': 'bg-orange-100 text-orange-800',
  '3': 'bg-yellow-100 text-yellow-800',
  '4': 'bg-blue-100 text-blue-800',
  '5': 'bg-gray-100 text-gray-800'
};

export const StateColors: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800',
  '2': 'bg-yellow-100 text-yellow-800',
  '3': 'bg-purple-100 text-purple-800',
  '6': 'bg-green-100 text-green-800',
  '7': 'bg-gray-100 text-gray-800',
  '8': 'bg-red-100 text-red-800'
};

// User Role types for POC
export type UserRole = 'L1' | 'L2' | 'L3' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface WorkNote {
  id: string;
  ticketId: string;
  author: string;
  role: UserRole;
  note: string;
  createdAt: string;
  isEscalationNote?: boolean;
  escalationReason?: string;
}

export interface EscalationRequest {
  ticketId: string;
  fromRole: UserRole;
  toRole: UserRole;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

export interface ReleaseNote {
  id: string;
  ticketNumber: string;
  shortDescription: string;
  priority: string;
  category: string;
  resolutionNotes: string;
  resolvedAt: string;
  resolvedBy: string;
  role: UserRole;
}

export const RoleLabels: Record<UserRole, string> = {
  'L1': 'L1 Support',
  'L2': 'L2 Business Analyst',
  'L3': 'L3 Dev/QA',
  'admin': 'Administrator'
};

export const RoleColors: Record<UserRole, string> = {
  'L1': 'bg-green-100 text-green-800',
  'L2': 'bg-blue-100 text-blue-800',
  'L3': 'bg-purple-100 text-purple-800',
  'admin': 'bg-gray-100 text-gray-800'
};

export const CategoryLabels: Record<string, string> = {
  'Inquiry': 'Inquiry',
  'Software': 'Software',
  'Hardware': 'Hardware',
  'Network': 'Network',
  'Database': 'Database',
  'Application': 'Application',
  'Security': 'Security',
  'Infrastructure': 'Infrastructure'
};
