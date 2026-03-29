import { useState } from 'react';
import type { ServiceNowTicket, UserRole } from '../types';
import { PriorityLabels, PriorityColors, TicketStateLabels, StateColors } from '../types';

interface TicketCardProps {
  ticket: ServiceNowTicket;
  currentRole: UserRole;
  onResolve: (ticketId: string, notes: string) => void;
  onEscalate: (ticketId: string, reason: string, targetRole: UserRole) => void;
  onViewDetails: (ticketId: string) => void;
}

export function TicketCard({ ticket, currentRole, onResolve, onEscalate, onViewDetails }: TicketCardProps) {
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('L2');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const canResolve = ['1', '2', '3'].includes(ticket.state);
  const canEscalate = currentRole !== 'L3' && ['1', '2', '3'].includes(ticket.state);

  const handleEscalate = () => {
    if (escalationReason.trim()) {
      onEscalate(ticket.sys_id, escalationReason, targetRole);
      setShowEscalateModal(false);
      setEscalationReason('');
    }
  };

  const handleResolve = () => {
    if (resolutionNotes.trim()) {
      onResolve(ticket.sys_id, resolutionNotes);
      setShowResolveModal(false);
      setResolutionNotes('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onViewDetails(ticket.sys_id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-blue-600">{ticket.number}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${PriorityColors[ticket.priority]}`}>
              {PriorityLabels[ticket.priority]}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${StateColors[ticket.state]}`}>
              {TicketStateLabels[ticket.state]}
            </span>
          </div>
          <span className="text-xs text-gray-500">{formatDate(ticket.opened_at)}</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{ticket.short_description}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <span><strong>Category:</strong> {ticket.category}</span>
            <span><strong>Caller:</strong> {ticket.caller_name || 'Unknown'}</span>
          </div>
          <span><strong>Assigned:</strong> {ticket.assigned_to_name || 'Unassigned'}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {canResolve && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowResolveModal(true);
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
            >
              Resolve
            </button>
          )}
          {canEscalate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEscalateModal(true);
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors"
            >
              Escalate
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(ticket.sys_id);
            }}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowEscalateModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalate Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">
              Escalating <strong>{ticket.number}</strong>: {ticket.short_description}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Escalate To</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currentRole === 'L1' && (
                  <>
                    <option value="L2">L2 - Business Analysis</option>
                    <option value="L3">L3 - Dev/QA</option>
                  </>
                )}
                {currentRole === 'L2' && (
                  <option value="L3">L3 - Dev/QA</option>
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Escalation</label>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Explain why this ticket needs to be escalated..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalationReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowResolveModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">
              Resolving <strong>{ticket.number}</strong>: {ticket.short_description}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolutionNotes.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
