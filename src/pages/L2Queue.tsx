import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ServiceNowTicket, UserRole } from '../types';
import { TicketCard } from '../components/TicketCard';
import { getMockService } from '../services/MockServiceNowService';

interface RoleQueueProps {
  role: UserRole;
  userName: string;
}

export function L2Queue({ role, userName }: RoleQueueProps) {
  const [tickets, setTickets] = useState<ServiceNowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'escalated_to_l2' | 'analysis' | 'resolved'>('all');
  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    const allTickets = await service.getTicketsByRole('L2');
    setTickets(allTickets);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [role, userName]);

  const handleResolve = async (ticketId: string, notes: string) => {
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    await service.updateTicket(ticketId, {
      state: '6',
      close_notes: notes,
      close_code: 'Resolved by Change'
    });
    
    await loadTickets();
  };

  const handleEscalate = async (ticketId: string, reason: string, targetRole: UserRole) => {
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    await service.escalateTicket(ticketId, reason, targetRole);
    await loadTickets();
  };

  // Filter tickets that were escalated to L2 (have work notes showing escalation from L1)
  const getTicketsWithEscalationFromL1 = () => {
    return tickets.filter(ticket => {
      // In a real implementation, we would check work notes for L1 escalation
      // For now, we'll consider tickets in L2 that were recently updated as escalated
      return ticket.assignment_group_name?.includes('L2') && 
             (ticket.state === '2' || ticket.state === '3');
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'escalated_to_l2':
        return ticket.state === '2' || ticket.state === '3';
      case 'analysis':
        return ticket.state === '2' && ticket.category === 'Application';
      case 'resolved':
        return ticket.state === '6' || ticket.state === '7';
      default:
        return true;
    }
  });

  const stats = {
    escalatedFromL1: getTicketsWithEscalationFromL1().length,
    inAnalysis: tickets.filter(t => t.state === '2' && t.category === 'Application').length,
    dataIssues: tickets.filter(t => t.category === 'Database').length,
    resolved: tickets.filter(t => t.state === '6' || t.state === '7').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">L2 Business Analysis Queue</h1>
          <p className="text-gray-600">Analyze business requirements, workflows, and data issues</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-medium text-gray-900">{userName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.escalatedFromL1}</div>
          <div className="text-sm text-gray-600">Escalated from L1</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.inAnalysis}</div>
          <div className="text-sm text-gray-600">Business Analysis</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.dataIssues}</div>
          <div className="text-sm text-gray-600">Data Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all', label: 'All Tickets' },
          { key: 'escalated_to_l2', label: `Active (${stats.escalatedFromL1})` },
          { key: 'analysis', label: `Analysis (${stats.inAnalysis})` },
          { key: 'resolved', label: `Resolved (${stats.resolved})` }
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tickets found in this category.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.sys_id}
              ticket={ticket}
              currentRole={role}
              onResolve={handleResolve}
              onEscalate={handleEscalate}
              onViewDetails={(id) => navigate(`/tickets/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
