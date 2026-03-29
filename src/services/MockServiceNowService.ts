import type {
  ServiceNowTicket,
  TicketFilters,
  CreateTicketRequest,
  UpdateTicketRequest,
} from '../types';

export type UserRole = 'L1' | 'L2' | 'L3' | 'admin';

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

// Dummy data generators
const FIRST_NAMES = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 'Raj', 'Priya', 'Chen', 'Yuki', 'Carlos', 'Maria'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Lee'];

const TICKET_TEMPLATES: Array<{
  shortDesc: string;
  description: string;
  category: string;
  subcategory: string;
  priority: string;
  escalationLevel: number;
}> = [
  // L1 Tickets - Basic IT support for healthcare staff
  {
    shortDesc: 'Epic EHR login failure',
    description: 'Nurse unable to log into Epic EHR system after password reset. Getting "Invalid credentials" error. User needs immediate access to update patient medications.',
    category: 'EHR/EMR',
    subcategory: 'Login Issues',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'Patient portal password reset',
    description: 'Patient calling to reset MyChart portal password. Unable to access lab results. Need to verify identity per HIPAA guidelines.',
    category: 'Patient Portal',
    subcategory: 'Password Reset',
    priority: '4',
    escalationLevel: 1
  },
  {
    shortDesc: 'Cerner PowerChart slow performance',
    description: 'ICU nurses reporting extremely slow loading times in PowerChart. Taking 5+ minutes to open patient charts during critical care.',
    category: 'EHR/EMR',
    subcategory: 'Performance',
    priority: '1',
    escalationLevel: 1
  },
  {
    shortDesc: 'Barcode scanner not working in pharmacy',
    description: 'Pharmacy technician unable to scan medication barcodes for dispensing. Scanner shows red light but not reading codes.',
    category: 'Medical Devices',
    subcategory: 'Barcode Scanner',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'VPN access for remote physician',
    description: 'Doctor unable to connect to hospital VPN from home to review patient charts. Need immediate access for on-call coverage.',
    category: 'Network',
    subcategory: 'VPN',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'Printer issue at nursing station',
    description: 'Nursing station printer not printing medication administration records (MAR). Multiple nurses affected on 3rd floor med-surg.',
    category: 'Hardware',
    subcategory: 'Printer',
    priority: '3',
    escalationLevel: 1
  },
  {
    shortDesc: 'PACS imaging workstation frozen',
    description: 'Radiologist workstation frozen while reading CT scans. System unresponsive, may lose unsaved annotations.',
    category: 'Imaging',
    subcategory: 'PACS',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'VoIP phone not working in patient room',
    description: 'Patient in room 302 unable to call nurse station. Call button works but phone shows "Line Unavailable".',
    category: 'Telecom',
    subcategory: 'VoIP',
    priority: '3',
    escalationLevel: 1
  },
  // L2 Tickets - Business Analysis / Clinical Informatics
  {
    shortDesc: 'HL7 interface failure - Lab to EHR',
    description: 'Lab results from Quest not flowing into Epic EHR. Interface down since 6 AM. 200+ results pending. Potential patient safety issue.',
    category: 'Interfaces',
    subcategory: 'HL7',
    priority: '1',
    escalationLevel: 2
  },
  {
    shortDesc: 'Clinical workflow issue - CPOE orders',
    description: 'Physicians reporting duplicate order entries in CPOE system. Orders appearing twice in patient chart. Affecting medication safety.',
    category: 'EHR/EMR',
    subcategory: 'CPOE',
    priority: '1',
    escalationLevel: 2
  },
  {
    shortDesc: 'Billing interface error - 837 claim rejections',
    description: 'Multiple insurance claims rejected due to ICD-10 coding errors. Need to analyze claim format and payer requirements.',
    category: 'Revenue Cycle',
    subcategory: 'Billing Interface',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Meaningful Use attestation report error',
    description: 'Quality measures report for MU Stage 3 showing incorrect data. May impact CMS reimbursement. Need data analysis.',
    category: 'Regulatory',
    subcategory: 'Meaningful Use',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Patient identity matching issues - MPI cleanup',
    description: 'Master Patient Index showing duplicate records for same patients. Affecting care coordination and patient safety.',
    category: 'Data Integrity',
    subcategory: 'MPI',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'ePrescribing controlled substances workflow',
    description: 'DEA EPCS certification expiring. Need to update 2FA workflow for prescribing controlled substances per DEA requirements.',
    category: 'Compliance',
    subcategory: 'EPCS',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Clinical decision support alerts tuning',
    description: 'Too many false positive drug-drug interaction alerts causing alert fatigue. Clinicians overriding all alerts. Need rules analysis.',
    category: 'Clinical Decision Support',
    subcategory: 'CDS Rules',
    priority: '3',
    escalationLevel: 2
  },
  {
    shortDesc: 'Interoperability issue - HIE connection',
    description: 'Health Information Exchange (HIE) not receiving ADT messages. Affecting care coordination with external providers.',
    category: 'Interoperability',
    subcategory: 'HIE',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Quality reporting for value-based care',
    description: 'MIPS/MACRA quality measures calculation incorrect. CMS reporting deadline approaching. Need business rules analysis.',
    category: 'Regulatory',
    subcategory: 'Quality Reporting',
    priority: '2',
    escalationLevel: 2
  },
  // L3 Tickets - Development / Infrastructure
  {
    shortDesc: 'FHIR API timeout - Patient access API',
    description: 'CMS Patient Access API (FHIR R4) timing out for bulk data requests. 21st Century Cures Act compliance issue.',
    category: 'Interoperability',
    subcategory: 'FHIR API',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Epic database connection pool exhausted',
    description: 'Chronicles database connection pool maxed out during morning shift change. 500+ concurrent users. System instability.',
    category: 'Database',
    subcategory: 'Performance',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Medical device integration - IV pump data',
    description: 'Smart IV pumps not sending dose error reduction data to EHR. IEEE 11073 standard implementation issue.',
    category: 'Medical Devices',
    subcategory: 'Device Integration',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'HIPAA audit logging failure',
    description: 'Audit logs not capturing user access to PHI as required by HIPAA. Security compliance issue. Centralized logging failure.',
    category: 'Security',
    subcategory: 'Audit Logging',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Legacy EMR data migration error',
    description: 'Historical patient data migration from legacy system failing. Data corruption in allergy records. Patient safety risk.',
    category: 'Data Migration',
    subcategory: 'Legacy Data',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Zero Trust security implementation',
    description: 'Implementing zero trust architecture for clinical systems. Certificate-based authentication for medical devices failing.',
    category: 'Security',
    subcategory: 'Zero Trust',
    priority: '2',
    escalationLevel: 3
  },
  {
    shortDesc: 'AI/ML model drift - Sepsis prediction',
    description: 'Epic Sepsis Prediction Model showing decreased accuracy. False negative rate increasing. Need model retraining.',
    category: 'AI/Clinical',
    subcategory: 'ML Model',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Ransomware recovery - backup validation',
    description: 'Validating backup integrity after security incident. Ensuring HIPAA disaster recovery capabilities for EHR systems.',
    category: 'Disaster Recovery',
    subcategory: 'Backup',
    priority: '1',
    escalationLevel: 3
  },
  {
    shortDesc: 'Telehealth video integration issue',
    description: 'Epic Telehealth integration with Zoom failing. HIPAA-compliant video visits not starting. Patient access issues.',
    category: 'Telehealth',
    subcategory: 'Video Integration',
    priority: '2',
    escalationLevel: 3
  },
  {
    shortDesc: 'SNOMED CT mapping error in problem list',
    description: 'Problem list terms not mapping correctly to SNOMED CT codes. Affecting interoperability and analytics.',
    category: 'Terminology',
    subcategory: 'SNOMED CT',
    priority: '2',
    escalationLevel: 3
  },
  // Payer/Insurance Tickets - Claims & Coverage
  {
    shortDesc: 'Insurance claim rejection - COB issue',
    description: 'Medicare secondary payer claim rejected due to coordination of benefits error. Patient has dual coverage.',
    category: 'Claims',
    subcategory: 'COB',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Prior authorization not found',
    description: 'Insurance denying claim stating prior auth required but auth number 12345 was obtained and on file.',
    category: 'Prior Auth',
    subcategory: 'Authorization',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Patient eligibility verification failure',
    description: 'Real-time eligibility check returning "Member not found" but patient has active insurance card.',
    category: 'Eligibility',
    subcategory: 'Verification',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'Claim batch submission failed - 837P',
    description: 'Professional claims batch (837P) failing to submit to clearinghouse. 500+ claims stuck in queue.',
    category: 'Claims',
    subcategory: '837P',
    priority: '1',
    escalationLevel: 2
  },
  {
    shortDesc: 'Insurance policy effective date mismatch',
    description: 'Payer rejecting claims stating coverage terminated but patient portal shows active policy.',
    category: 'Policy',
    subcategory: 'Effective Date',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Out of network benefits calculation error',
    description: 'System applying in-network rates for out-of-network provider. Patient balance incorrect.',
    category: 'Benefits',
    subcategory: 'OON Rates',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Electronic remittance advice not posting',
    description: 'ERA (835) files from Blue Cross not auto-posting to patient accounts. Manual posting required.',
    category: 'Remittance',
    subcategory: 'ERA 835',
    priority: '3',
    escalationLevel: 2
  },
  {
    shortDesc: 'Deductible accumulation not updating',
    description: 'Patient deductible showing $0 met but patient has paid $2,500 out of pocket this year.',
    category: 'Benefits',
    subcategory: 'Deductible',
    priority: '3',
    escalationLevel: 2
  },
  {
    shortDesc: 'Claim status inquiry 276/277 error',
    description: 'HIPAA 276 claim status request returning 277 response with incorrect claim status codes.',
    category: 'Claims',
    subcategory: '276/277',
    priority: '3',
    escalationLevel: 3
  },
  {
    shortDesc: 'Medical necessity denial - appeal needed',
    description: 'Insurance denied MRI as not medically necessary. Need to generate appeal letter with clinical notes.',
    category: 'Appeals',
    subcategory: 'Medical Necessity',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Pre-certification for surgery expired',
    description: 'Surgery pre-auth obtained 60 days ago, expired yesterday. Patient scheduled for tomorrow.',
    category: 'Prior Auth',
    subcategory: 'Pre-Certification',
    priority: '1',
    escalationLevel: 2
  },
  {
    shortDesc: 'Coverage gap report generation',
    description: 'Finance team needs report of patients with potential coverage gaps for upcoming appointments.',
    category: 'Reporting',
    subcategory: 'Coverage Gap',
    priority: '4',
    escalationLevel: 2
  },
  {
    shortDesc: 'NPI/TIN mismatch on claim rejection',
    description: 'Claims rejecting stating rendering provider NPI does not match TIN on file with payer.',
    category: 'Claims',
    subcategory: 'Provider Setup',
    priority: '2',
    escalationLevel: 2
  },
  {
    shortDesc: 'Workers compensation claim routing',
    description: 'Work comp claim incorrectly routed to commercial payer. Need to bill state WC carrier.',
    category: 'Claims',
    subcategory: 'Workers Comp',
    priority: '2',
    escalationLevel: 1
  },
  {
    shortDesc: 'Medicare Advantage plan benefits inquiry',
    description: 'Patient has new Medicare Advantage plan, need to verify covered services and copays.',
    category: 'Eligibility',
    subcategory: 'Medicare Advantage',
    priority: '3',
    escalationLevel: 1
  },
  {
    shortDesc: 'Claim scrubber rules update - ICD-10',
    description: 'New ICD-10 codes not recognized by claim scrubber, causing valid claims to fail edits.',
    category: 'Claims',
    subcategory: 'Claim Scrubber',
    priority: '2',
    escalationLevel: 3
  },
  {
    shortDesc: 'Patient financial responsibility estimate error',
    description: 'Cost estimator showing incorrect patient responsibility due to wrong deductible calculation.',
    category: 'Patient Estimates',
    subcategory: 'Calculator',
    priority: '3',
    escalationLevel: 2
  },
  {
    shortDesc: 'Insurance card scanning - OCR failure',
    description: 'Front desk unable to scan insurance cards, OCR not reading policy numbers correctly.',
    category: 'Registration',
    subcategory: 'Insurance Scan',
    priority: '4',
    escalationLevel: 1
  },
  {
    shortDesc: 'No Surprises Act compliance - Good faith estimate',
    description: 'Need to generate Good Faith Estimate for uninsured patient per No Surprises Act requirements.',
    category: 'Compliance',
    subcategory: 'NSA GFE',
    priority: '3',
    escalationLevel: 2
  }
];

const CLOSE_CODES = [
  'Resolved',
  'Resolved by Workaround',
  'Resolved by Change',
  'Not Reproducible',
  'Not Resolved',
  'Duplicate',
  'No longer needed'
];

// Helper functions
const generateId = (): string => {
  return 'sys_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateTicketNumber = (index: number): string => {
  return 'INC' + String(1000000 + index).slice(1);
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomName = (): string => {
  return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
};

const generatePastDate = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
};

// Mock ticket storage
let mockTickets: ServiceNowTicket[] = [];
let mockWorkNotes: WorkNote[] = [];
let currentTicketIndex = 0;

class MockServiceNowService {
  private currentUser: { name: string; role: UserRole } | null = null;

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    // Generate 50 dummy tickets with various states and priorities
    const tickets: ServiceNowTicket[] = [];
    
    for (let i = 0; i < 50; i++) {
      const template = getRandomItem(TICKET_TEMPLATES);
      const openedAt = generatePastDate(30);
      const state = this.determineState(i);
      
      let resolvedAt: string | undefined;
      let closedAt: string | undefined;
      let assignedTo = generateRandomName();
      
      if (state === '6' || state === '7') {
        resolvedAt = generatePastDate(10);
        closedAt = state === '7' ? generatePastDate(5) : undefined;
      }

      const ticket: ServiceNowTicket = {
        sys_id: generateId(),
        number: generateTicketNumber(i + 1),
        short_description: template.shortDesc,
        description: template.description,
        state: state,
        priority: template.priority,
        urgency: template.priority <= '2' ? '1' : template.priority === '3' ? '2' : '3',
        impact: template.priority <= '2' ? '1' : template.priority === '3' ? '2' : '3',
        category: template.category,
        subcategory: template.subcategory,
        caller_id: generateId(),
        caller_name: generateRandomName(),
        assigned_to: generateId(),
        assigned_to_name: assignedTo,
        assignment_group: generateId(),
        assignment_group_name: this.getAssignmentGroup(template.escalationLevel),
        opened_at: openedAt,
        opened_by: generateId(),
        resolved_at: resolvedAt,
        closed_at: closedAt,
        close_code: resolvedAt ? getRandomItem(CLOSE_CODES) : undefined,
        close_notes: resolvedAt ? this.generateCloseNotes(template.escalationLevel) : undefined,
        sys_created_on: openedAt,
        sys_updated_on: resolvedAt || openedAt,
        sys_updated_by: assignedTo
      };

      tickets.push(ticket);

      // Generate work notes for the ticket
      this.generateWorkNotesForTicket(ticket, template.escalationLevel);
    }

    mockTickets = tickets.sort((a, b) => 
      new Date(b.sys_updated_on).getTime() - new Date(a.sys_updated_on).getTime()
    );
    currentTicketIndex = tickets.length;
  }

  private determineState(index: number): string {
    // Distribute tickets across different states
    const distribution = [
      '1', '1', '1', '1', // New (20%)
      '2', '2', '2', '2', '2', '2', // In Progress (30%)
      '3', '3', // On Hold (10%)
      '6', '6', '6', '6', // Resolved (20%)
      '7', '7', '7', // Closed (15%)
      '8' // Cancelled (5%)
    ];
    return distribution[index % distribution.length];
  }

  private getAssignmentGroup(escalationLevel: number): string {
    switch (escalationLevel) {
      case 1: return 'L1 Service Desk';
      case 2: return 'L2 Business Analysis';
      case 3: return 'L3 Development & QA';
      default: return 'Service Desk';
    }
  }

  private generateCloseNotes(escalationLevel: number): string {
    const notes: Record<number, string[]> = {
      1: [
        'Resolved: Reset Epic EHR password and cleared cached credentials. User can now access patient charts.',
        'Resolved: MyChart password reset completed after identity verification per HIPAA.',
        'Resolved: Restarted PACS workstation, restored radiologist annotations from auto-save.',
        'Resolved: Replaced pharmacy barcode scanner, tested with medication dispensing workflow.',
        'Resolved: Reconfigured VPN profile for physician remote access to EHR.',
        'Resolved: Nursing station printer driver updated, MAR printing restored.',
        'Resolved: Patient room VoIP phone reconfigured, nurse call functionality restored.'
      ],
      2: [
        'Resolved: HL7 interface engine restarted, queued lab results flowed into Epic. 200+ results processed successfully.',
        'Resolved: CPOE order duplication issue fixed - corrected business rule in Epic workflow.',
        'Resolved: ICD-10 mapping updated in billing interface, rejected claims resubmitted successfully.',
        'Resolved: Meaningful Use quality measures recalculated, CMS attestation data corrected.',
        'Resolved: MPI duplicate records merged using EMPI algorithm, patient identity unified.',
        'Resolved: DEA EPCS 2FA workflow updated, providers can now prescribe controlled substances.',
        'Resolved: Drug-drug interaction alert thresholds tuned, false positive rate reduced by 60%.',
        'Resolved: HIE ADT interface connection restored, external providers receiving notifications.',
        'Resolved: MIPS quality measures calculation corrected, MACRA reporting data validated.',
        'Resolved: COB coordination updated, Medicare secondary claims now processing correctly.',
        'Resolved: Prior authorization 12345 located and linked to claim, denial overturned.',
        'Resolved: 837P batch resubmitted successfully, 500+ claims transmitted to clearinghouse.',
        'Resolved: Policy effective date corrected in payer system, claims reprocessed.',
        'Resolved: OON benefits calculation fixed, patient balance adjusted by $1,250.',
        'Resolved: ERA 835 auto-posting restored, Blue Cross payments now processing.',
        'Resolved: Deductible accumulator synchronized with payer, patient responsibility updated.',
        'Resolved: Medical necessity appeal submitted with clinical notes, authorization approved.',
        'Resolved: Surgery pre-certification revalidated, patient approved for tomorrow\'s procedure.',
        'Resolved: Coverage gap report generated, 45 patients identified for verification.',
        'Resolved: NPI/TIN mismatch corrected with payer, claims resubmitted successfully.',
        'Resolved: Workers comp claim rerouted to state carrier, new claim number assigned.',
        'Resolved: Medicare Advantage benefits verified, patient copays confirmed in system.',
        'Resolved: Patient cost estimate recalculated, deductible and OOP max applied correctly.',
        'Resolved: Good Faith Estimate generated per NSA requirements, patient notified.'
      ],
      3: [
        'Resolved: FHIR R4 API timeout configuration increased to 120s, Patient Access API responding.',
        'Resolved: Epic Chronicles connection pool expanded to 100 connections, morning shift performance improved.',
        'Resolved: Smart pump IEEE 11073 integration fixed, dose error data now flowing to EHR.',
        'Resolved: HIPAA audit logging service restored, all PHI access now being captured.',
        'Resolved: Legacy EMR allergy data migration completed with validation, patient safety ensured.',
        'Resolved: Zero trust certificates deployed to medical devices, secure authentication enabled.',
        'Resolved: Sepsis prediction model retrained with recent data, accuracy restored to 94%.',
        'Resolved: EHR backup integrity validated, HIPAA disaster recovery capability confirmed.',
        'Resolved: Epic-Zoom telehealth integration patched, HIPAA-compliant video visits restored.',
        'Resolved: SNOMED CT mapping rules updated, problem list interoperability restored.'
      ]
    };
    return getRandomItem(notes[escalationLevel] || notes[1]);
  }

  private generateWorkNotesForTicket(ticket: ServiceNowTicket, escalationLevel: number): void {
    const notes: WorkNote[] = [];
    
    // Initial assignment note
    notes.push({
      id: generateId(),
      ticketId: ticket.sys_id,
      author: ticket.assigned_to_name || 'System',
      role: 'L1',
      note: `Ticket assigned to ${ticket.assignment_group_name}. Initial review in progress.`,
      createdAt: ticket.opened_at
    });

    // Add escalation notes based on level
    if (escalationLevel >= 2) {
      notes.push({
        id: generateId(),
        ticketId: ticket.sys_id,
        author: ticket.assigned_to_name || 'L1 Agent',
        role: 'L1',
        note: 'Initial troubleshooting completed. Issue requires business analysis.',
        createdAt: generatePastDate(20),
        isEscalationNote: true,
        escalationReason: 'Business rules analysis required'
      });
    }

    if (escalationLevel >= 3) {
      notes.push({
        id: generateId(),
        ticketId: ticket.sys_id,
        author: 'BA Team',
        role: 'L2',
        note: 'Business analysis complete. Root cause identified as technical issue requiring development fix.',
        createdAt: generatePastDate(15),
        isEscalationNote: true,
        escalationReason: 'Code fix and testing required'
      });
    }

    // Add resolution note
    if (ticket.state === '6' || ticket.state === '7') {
      const resolvingRole = escalationLevel === 1 ? 'L1' : escalationLevel === 2 ? 'L2' : 'L3';
      notes.push({
        id: generateId(),
        ticketId: ticket.sys_id,
        author: ticket.assigned_to_name || 'Resolver',
        role: resolvingRole,
        note: ticket.close_notes || 'Issue resolved.',
        createdAt: ticket.resolved_at || ticket.sys_updated_on
      });
    }

    mockWorkNotes.push(...notes);
  }

  // Set current user context
  setCurrentUser(name: string, role: UserRole): void {
    this.currentUser = { name, role };
  }

  getCurrentUser(): { name: string; role: UserRole } | null {
    return this.currentUser;
  }

  // Get tickets with filters
  async getTickets(filters: TicketFilters = {}): Promise<{ tickets: ServiceNowTicket[]; total: number }> {
    let filtered = [...mockTickets];

    if (filters.state) {
      filtered = filtered.filter(t => t.state === filters.state);
    }
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.assigned_to) {
      filtered = filtered.filter(t => t.assigned_to === filters.assigned_to);
    }
    if (filters.caller_id) {
      filtered = filtered.filter(t => t.caller_id === filters.caller_id);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.short_description.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.number.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return { tickets: paginated, total };
  }

  // Get single ticket
  async getTicket(sysId: string): Promise<ServiceNowTicket | null> {
    return mockTickets.find(t => t.sys_id === sysId) || null;
  }

  // Create ticket
  async createTicket(request: CreateTicketRequest): Promise<ServiceNowTicket> {
    currentTicketIndex++;
    const now = new Date().toISOString();
    
    const ticket: ServiceNowTicket = {
      sys_id: generateId(),
      number: generateTicketNumber(currentTicketIndex),
      short_description: request.short_description,
      description: request.description,
      state: '1',
      priority: request.priority || '3',
      urgency: request.urgency || '2',
      impact: request.impact || '2',
      category: request.category || 'Inquiry',
      subcategory: request.subcategory || 'General',
      caller_id: request.caller_id,
      caller_name: generateRandomName(),
      assigned_to: request.assigned_to || generateId(),
      assigned_to_name: generateRandomName(),
      assignment_group: request.assignment_group || generateId(),
      assignment_group_name: 'L1 Service Desk',
      opened_at: now,
      opened_by: request.caller_id,
      sys_created_on: now,
      sys_updated_on: now,
      sys_updated_by: this.currentUser?.name || 'System'
    };

    mockTickets.unshift(ticket);

    // Add initial work note
    mockWorkNotes.push({
      id: generateId(),
      ticketId: ticket.sys_id,
      author: this.currentUser?.name || 'System',
      role: this.currentUser?.role || 'L1',
      note: 'Ticket created and assigned to L1 Service Desk.',
      createdAt: now
    });

    return ticket;
  }

  // Update ticket
  async updateTicket(sysId: string, updates: UpdateTicketRequest): Promise<ServiceNowTicket | null> {
    const index = mockTickets.findIndex(t => t.sys_id === sysId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const ticket = mockTickets[index];

    // Update fields
    if (updates.short_description) ticket.short_description = updates.short_description;
    if (updates.description) ticket.description = updates.description;
    if (updates.state) {
      ticket.state = updates.state;
      if (updates.state === '6') {
        ticket.resolved_at = now;
      }
      if (updates.state === '7') {
        ticket.closed_at = now;
        if (!ticket.resolved_at) ticket.resolved_at = now;
      }
    }
    if (updates.priority) ticket.priority = updates.priority;
    if (updates.urgency) ticket.urgency = updates.urgency;
    if (updates.impact) ticket.impact = updates.impact;
    if (updates.assigned_to) ticket.assigned_to = updates.assigned_to;
    if (updates.assignment_group) ticket.assignment_group = updates.assignment_group;
    if (updates.close_code) ticket.close_code = updates.close_code;
    if (updates.close_notes) ticket.close_notes = updates.close_notes;

    ticket.sys_updated_on = now;
    ticket.sys_updated_by = this.currentUser?.name || 'System';

    // Add work note if provided
    if (updates.work_notes) {
      mockWorkNotes.push({
        id: generateId(),
        ticketId: ticket.sys_id,
        author: this.currentUser?.name || 'System',
        role: this.currentUser?.role || 'L1',
        note: updates.work_notes,
        createdAt: now
      });
    }

    mockTickets[index] = ticket;
    return ticket;
  }

  // Escalate ticket
  async escalateTicket(sysId: string, reason: string, targetRole: UserRole): Promise<ServiceNowTicket | null> {
    const ticket = await this.getTicket(sysId);
    if (!ticket) return null;

    const now = new Date().toISOString();
    const assignmentGroups: Record<UserRole, string> = {
      'L1': 'L1 Service Desk',
      'L2': 'L2 Business Analysis',
      'L3': 'L3 Development & QA',
      'admin': 'Admin Team'
    };

    const updates: UpdateTicketRequest = {
      state: '2', // In Progress
      assignment_group: generateId(),
      work_notes: `Escalated to ${targetRole}: ${reason}`,
      assigned_to: generateId()
    };

    const updated = await this.updateTicket(sysId, updates);
    if (updated) {
      updated.assignment_group_name = assignmentGroups[targetRole];
      updated.assigned_to_name = generateRandomName();

      // Add escalation work note
      mockWorkNotes.push({
        id: generateId(),
        ticketId: ticket.sys_id,
        author: this.currentUser?.name || 'System',
        role: this.currentUser?.role || 'L1',
        note: `Escalated to ${targetRole} team.`,
        createdAt: now,
        isEscalationNote: true,
        escalationReason: reason
      });
    }

    return updated;
  }

  // Get work notes for ticket
  async getWorkNotes(ticketId: string): Promise<WorkNote[]> {
    return mockWorkNotes
      .filter(n => n.ticketId === ticketId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get ticket statistics
  async getTicketStats(): Promise<{
    total: number;
    byState: Record<string, number>;
    byPriority: Record<string, number>;
    byEscalation: Record<string, number>;
  }> {
    const byState: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byEscalation: Record<string, number> = { L1: 0, L2: 0, L3: 0 };

    mockTickets.forEach(ticket => {
      byState[ticket.state] = (byState[ticket.state] || 0) + 1;
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
      
      // Determine escalation level from assignment group
      if (ticket.assignment_group_name?.includes('L3')) {
        byEscalation.L3++;
      } else if (ticket.assignment_group_name?.includes('L2')) {
        byEscalation.L2++;
      } else {
        byEscalation.L1++;
      }
    });

    return {
      total: mockTickets.length,
      byState,
      byPriority,
      byEscalation
    };
  }

  // Generate release notes
  async generateReleaseNotes(
    priority: string | null,
    startDate: string,
    endDate: string
  ): Promise<ReleaseNote[]> {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const resolvedTickets = mockTickets.filter(t => {
      if (!t.resolved_at) return false;
      const resolvedTime = new Date(t.resolved_at).getTime();
      if (resolvedTime < start || resolvedTime > end) return false;
      if (priority && t.priority !== priority) return false;
      return true;
    });

    const releaseNotes: ReleaseNote[] = resolvedTickets.map(ticket => {
      // Determine role from work notes
      const notes = mockWorkNotes.filter(n => n.ticketId === ticket.sys_id);
      const lastNote = notes[notes.length - 1];
      const role = lastNote?.role || 'L1';

      return {
        id: generateId(),
        ticketNumber: ticket.number,
        shortDescription: ticket.short_description,
        priority: ticket.priority,
        category: ticket.category,
        resolutionNotes: ticket.close_notes || 'No resolution notes provided.',
        resolvedAt: ticket.resolved_at || '',
        resolvedBy: ticket.assigned_to_name || 'Unknown',
        role
      };
    });

    return releaseNotes.sort((a, b) => 
      new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );
  }

  // Get tickets by role
  async getTicketsByRole(role: UserRole): Promise<ServiceNowTicket[]> {
    return mockTickets.filter(t => {
      if (role === 'L1') {
        return t.assignment_group_name?.includes('L1') || 
               (!t.assignment_group_name?.includes('L2') && !t.assignment_group_name?.includes('L3'));
      }
      if (role === 'L2') {
        return t.assignment_group_name?.includes('L2');
      }
      if (role === 'L3') {
        return t.assignment_group_name?.includes('L3');
      }
      return true;
    });
  }

  // Reset all data (for testing)
  resetData(): void {
    mockTickets = [];
    mockWorkNotes = [];
    currentTicketIndex = 0;
    this.initializeDummyData();
  }

  // Analyze ticket and find similar resolved tickets for suggested resolutions
  async analyzeTicketForSimilar(ticketId: string): Promise<{
    hasSimilarTickets: boolean;
    similarTickets: Array<{
      ticket: ServiceNowTicket;
      relevanceScore: number;
      suggestedResolution: string | null;
    }>;
    analysisMessage: string;
  }> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) {
      return {
        hasSimilarTickets: false,
        similarTickets: [],
        analysisMessage: 'Ticket not found for analysis.'
      };
    }

    // Only analyze tickets in "New" state
    if (ticket.state !== '1') {
      return {
        hasSimilarTickets: false,
        similarTickets: [],
        analysisMessage: 'Ticket analysis is only available for tickets in "New" state.'
      };
    }

    // Find resolved tickets with same category or similar keywords
    const resolvedTickets = mockTickets.filter(t => 
      (t.state === '6' || t.state === '7') && // Resolved or Closed
      t.sys_id !== ticket.sys_id // Exclude current ticket
    );

    const similarTickets: Array<{
      ticket: ServiceNowTicket;
      relevanceScore: number;
      suggestedResolution: string | null;
    }> = [];

    // Get keywords from current ticket
    const currentKeywords = this.extractKeywords(ticket.short_description + ' ' + ticket.description);
    const currentCategory = ticket.category.toLowerCase();
    const currentSubcategory = ticket.subcategory.toLowerCase();

    for (const resolvedTicket of resolvedTickets) {
      let relevanceScore = 0;
      
      // Category match (highest weight)
      if (resolvedTicket.category.toLowerCase() === currentCategory) {
        relevanceScore += 40;
      }
      
      // Subcategory match
      if (resolvedTicket.subcategory.toLowerCase() === currentSubcategory) {
        relevanceScore += 25;
      }
      
      // Keyword matching
      const resolvedKeywords = this.extractKeywords(resolvedTicket.short_description + ' ' + resolvedTicket.description);
      const matchingKeywords = currentKeywords.filter(kw => resolvedKeywords.includes(kw));
      relevanceScore += matchingKeywords.length * 10;
      
      // Priority match (bonus)
      if (resolvedTicket.priority === ticket.priority) {
        relevanceScore += 5;
      }

      // Only include if relevance score is significant
      if (relevanceScore >= 30) {
        similarTickets.push({
          ticket: resolvedTicket,
          relevanceScore,
          suggestedResolution: resolvedTicket.close_notes || null
        });
      }
    }

    // Sort by relevance score (highest first)
    similarTickets.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Take top 5 most relevant
    const topSimilar = similarTickets.slice(0, 5);

    let analysisMessage: string;
    if (topSimilar.length === 0) {
      analysisMessage = 'No similar resolved tickets found. This appears to be a new issue with no reference tickets to check.';
    } else {
      const highRelevance = topSimilar.filter(t => t.relevanceScore >= 70);
      if (highRelevance.length > 0) {
        analysisMessage = `Found ${highRelevance.length} highly relevant resolved ticket(s) with similar category/subcategory. Review suggested resolutions below.`;
      } else if (topSimilar.length >= 2) {
        analysisMessage = `Found ${topSimilar.length} potentially related tickets. Review for possible resolution patterns.`;
      } else {
        analysisMessage = 'Found 1 related ticket. Review the resolution for possible guidance.';
      }
    }

    return {
      hasSimilarTickets: topSimilar.length > 0,
      similarTickets: topSimilar,
      analysisMessage
    };
  }

  // Helper to extract keywords from text
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Common healthcare/IT words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this',
      'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
      'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they',
      'them', 'their', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
      'where', 'why', 'how', 'what', 'who', 'which', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'to',
      'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about',
      'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'under', 'again', 'further', 'here', 'there', 'once'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word)
      );
  }
}

// Create singleton instance
let mockServiceInstance: MockServiceNowService | null = null;

export const getMockService = (): MockServiceNowService => {
  if (!mockServiceInstance) {
    mockServiceInstance = new MockServiceNowService();
  }
  return mockServiceInstance;
};

export const resetMockService = (): void => {
  mockServiceInstance = null;
};

export default MockServiceNowService;
