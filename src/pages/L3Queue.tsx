import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ServiceNowTicket, UserRole } from '../types';
import { PriorityLabels } from '../types';
import { TicketCard } from '../components/TicketCard';
import { getMockService } from '../services/MockServiceNowService';

interface RoleQueueProps {
  role: UserRole;
  userName: string;
}

export function L3Queue({ role, userName }: RoleQueueProps) {
  const [tickets, setTickets] = useState<ServiceNowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'dev' | 'qa' | 'resolved'>('all');
  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    const service = getMockService();
    service.setCurrentUser(userName, role);
    
    const allTickets = await service.getTicketsByRole('L3');
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

  const handleEscalate = async (_ticketId: string, _reason: string, _targetRole: UserRole) => {
    // L3 cannot escalate further in this demo
    alert('L3 is the highest support tier. Cannot escalate further.');
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'critical':
        return ticket.priority === '1' || ticket.priority === '2';
      case 'dev':
        return ticket.category === 'Application' || ticket.category === 'Infrastructure';
      case 'qa':
        return ticket.category === 'Application' && (ticket.subcategory === 'Mobile' || ticket.state === '2');
      case 'resolved':
        return ticket.state === '6' || ticket.state === '7';
      default:
        return true;
    }
  });

  const stats = {
    critical: tickets.filter(t => t.priority === '1' || t.priority === '2').length,
    development: tickets.filter(t => t.category === 'Application' || t.category === 'Infrastructure').length,
    security: tickets.filter(t => t.category === 'Security').length,
    resolved: tickets.filter(t => t.state === '6' || t.state === '7').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">L3 Dev/QA Queue</h1>
          <p className="text-gray-600">Handle complex technical issues, code fixes, and infrastructure problems</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-medium text-gray-900">{userName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Critical/High Priority</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.development}</div>
          <div className="text-sm text-gray-600">Development Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.security}</div>
          <div className="text-sm text-gray-600">Security Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Priority Breakdown</h3>
        <div className="flex gap-4">
          {Object.entries(PriorityLabels).map(([priority, label]) => {
            const count = tickets.filter(t => t.priority === priority).length;
            const colors: Record<string, string> = {
              '1': 'bg-red-100 text-red-800',
              '2': 'bg-orange-100 text-orange-800',
              '3': 'bg-yellow-100 text-yellow-800',
              '4': 'bg-blue-100 text-blue-800',
              '5': 'bg-gray-100 text-gray-800'
            };
            return (
              <div key={priority} className={`px-3 py-2 rounded ${colors[priority]}`}>
                <span className="font-medium">{label}:</span> {count}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all', label: 'All Tickets' },
          { key: 'critical', label: `Critical/High (${stats.critical})` },
          { key: 'dev', label: `Dev Issues (${stats.development})` },
          { key: 'qa', label: 'QA Testing' },
          { key: 'resolved', label: `Resolved (${stats.resolved})` }
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-purple-600 text-white'
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
