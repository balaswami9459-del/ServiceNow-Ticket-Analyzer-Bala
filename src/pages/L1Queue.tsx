import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ServiceNowTicket, UserRole } from '../types';
import { TicketCard } from '../components/TicketCard';
import { getMockService } from '../services/MockServiceNowService';

interface RoleQueueProps {
  role: UserRole;
  userName: string;
}

export function L1Queue({ role, userName }: RoleQueueProps) {
  const [tickets, setTickets] = useState<ServiceNowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'escalated'>('all');
  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    const allTickets = await service.getTicketsByRole('L1');
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
      close_code: 'Resolved'
    });
    
    await loadTickets();
  };

  const handleEscalate = async (ticketId: string, reason: string, targetRole: UserRole) => {
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    await service.escalateTicket(ticketId, reason, targetRole);
    await loadTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'new':
        return ticket.state === '1';
      case 'in_progress':
        return ticket.state === '2';
      case 'escalated':
        return ticket.state === '3';
      default:
        return true;
    }
  });

  const stats = {
    new: tickets.filter(t => t.state === '1').length,
    inProgress: tickets.filter(t => t.state === '2').length,
    escalated: tickets.filter(t => t.state === '3').length,
    resolved: tickets.filter(t => t.state === '6' || t.state === '7').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">L1 Support Queue</h1>
          <p className="text-gray-600">Handle basic inquiries and simple technical issues</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-medium text-gray-900">{userName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-600">New Tickets</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.escalated}</div>
          <div className="text-sm text-gray-600">On Hold</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved/Closed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'new', 'in_progress', 'escalated'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' && 'All Tickets'}
            {f === 'new' && `New (${stats.new})`}
            {f === 'in_progress' && `In Progress (${stats.inProgress})`}
            {f === 'escalated' && `On Hold (${stats.escalated})`}
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
