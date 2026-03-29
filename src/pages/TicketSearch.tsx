import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ServiceNowTicket } from '../types';
import { TicketStateLabels, PriorityLabels, PriorityColors, StateColors } from '../types';
import { getMockService } from '../services/MockServiceNowService';

export function TicketSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticket, setTicket] = useState<ServiceNowTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setTicket(null);
    setSearched(true);

    try {
      const service = getMockService();
      const tickets = await service.getTickets({ search: searchQuery.trim() });
      
      if (tickets.tickets.length === 0) {
        // Try searching by exact ticket number
        const allTickets = await service.getTickets({});
        const foundByNumber = allTickets.tickets.find(
          t => t.number.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        
        if (foundByNumber) {
          setTicket(foundByNumber);
        } else {
          setError(`No ticket found with ID or matching "${searchQuery}"`);
        }
      } else {
        // If multiple results, prefer exact match on ticket number
        const exactMatch = tickets.tickets.find(
          t => t.number.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        setTicket(exactMatch || tickets.tickets[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case '1': return <Clock className="w-5 h-5" />;
      case '2': return <Clock className="w-5 h-5" />;
      case '3': return <AlertCircle className="w-5 h-5" />;
      case '6': return <CheckCircle className="w-5 h-5" />;
      case '7': return <CheckCircle className="w-5 h-5" />;
      case '8': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Search</h1>
        <p className="text-gray-600">Search for tickets by ID (e.g., INC0001234) or keywords</p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter ticket number (e.g., INC0001234) or search keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Quick Search Tips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Quick search:</span>
          {['INC0001001', 'INC0001020', 'INC0001050'].map((num) => (
            <button
              key={num}
              onClick={() => {
                setSearchQuery(num);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-medium text-red-900">Ticket Not Found</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {ticket && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl text-blue-600">{ticket.number}</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${PriorityColors[ticket.priority]}`}>
                      {PriorityLabels[ticket.priority]}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${StateColors[ticket.state]}`}>
                      {getStateIcon(ticket.state)}
                      {TicketStateLabels[ticket.state]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Opened: {formatDate(ticket.opened_at)}
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{ticket.short_description}</h2>
                <p className="text-gray-600">{ticket.description}</p>
              </div>

              {/* Ticket Details Grid */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Ticket Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Category</p>
                    <p className="font-medium text-gray-900">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Subcategory</p>
                    <p className="font-medium text-gray-900">{ticket.subcategory}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Assignment Group</p>
                    <p className="font-medium text-gray-900">{ticket.assignment_group_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Assigned To</p>
                    <p className="font-medium text-gray-900">{ticket.assigned_to_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Caller</p>
                    <p className="font-medium text-gray-900">{ticket.caller_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Urgency / Impact</p>
                    <p className="font-medium text-gray-900">{ticket.urgency} / {ticket.impact}</p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Status Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ticket Created</p>
                      <p className="text-sm text-gray-500">{formatDate(ticket.opened_at)}</p>
                    </div>
                  </div>
                  
                  {ticket.resolved_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ticket Resolved</p>
                        <p className="text-sm text-gray-500">{formatDate(ticket.resolved_at)}</p>
                        {ticket.close_notes && (
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            <strong>Resolution:</strong> {ticket.close_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {ticket.closed_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ticket Closed</p>
                        <p className="text-sm text-gray-500">{formatDate(ticket.closed_at)}</p>
                        {ticket.close_code && (
                          <p className="text-sm text-gray-600">Close Code: {ticket.close_code}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!ticket.resolved_at && !ticket.closed_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Current Status: {TicketStateLabels[ticket.state]}</p>
                        <p className="text-sm text-gray-500">
                          Last updated: {formatDate(ticket.sys_updated_on)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
