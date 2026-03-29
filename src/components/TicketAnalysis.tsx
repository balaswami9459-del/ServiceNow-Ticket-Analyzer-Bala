import { useState, useEffect } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, ChevronRight, RefreshCw, XCircle } from 'lucide-react';
import type { ServiceNowTicket } from '../types';
import { PriorityColors, StateColors, PriorityLabels, TicketStateLabels } from '../types';
import { getMockService } from '../services/MockServiceNowService';

interface TicketAnalysisProps {
  ticketId: string;
  ticketCategory?: string;
}

export function TicketAnalysis({ ticketId, ticketCategory }: TicketAnalysisProps) {
  const [analysis, setAnalysis] = useState<{
    hasSimilarTickets: boolean;
    similarTickets: Array<{
      ticket: ServiceNowTicket;
      relevanceScore: number;
      suggestedResolution: string | null;
    }>;
    analysisMessage: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mockService = getMockService();
      const result = await mockService.analyzeTicketForSimilar(ticketId);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      runAnalysis();
    }
  }, [ticketId]);

  const getRelevanceBadge = (score: number) => {
    if (score >= 70) return { color: 'bg-green-100 text-green-800', label: 'High Match' };
    if (score >= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Match' };
    return { color: 'bg-blue-100 text-blue-800', label: 'Related' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Analyzing ticket for similar issues...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={runAnalysis}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              analysis.hasSimilarTickets ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {analysis.hasSimilarTickets ? (
                <Lightbulb className="w-5 h-5 text-green-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ticket Analysis
              </h3>
              <p className="text-sm text-gray-600">{analysis.analysisMessage}</p>
            </div>
          </div>
          <button
            onClick={runAnalysis}
            className="text-gray-500 hover:text-gray-700"
            title="Re-run analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!analysis.hasSimilarTickets ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <XCircle className="w-12 h-12 text-blue-400 mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">
              No Reference Tickets Found
            </h4>
            <p className="text-gray-600 max-w-md">
              This appears to be a unique issue with no similar resolved tickets in the system. 
              Please proceed with standard troubleshooting procedures.
            </p>
            {ticketCategory && (
              <div className="mt-4 inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                Category: {ticketCategory}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              The following resolved tickets may provide guidance for handling this issue:
            </p>
            
            {analysis.similarTickets.map(({ ticket, relevanceScore, suggestedResolution }) => {
              const badge = getRelevanceBadge(relevanceScore);
              const isExpanded = expandedTicket === ticket.sys_id;
              
              return (
                <div
                  key={ticket.sys_id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Ticket Header - Always Visible */}
                  <div
                    className="p-4 cursor-pointer bg-white"
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.sys_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {ticket.number}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                            {badge.label} ({relevanceScore}%)
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {ticket.short_description}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{ticket.subcategory}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded ${PriorityColors[ticket.priority] || 'bg-gray-100'}`}>
                            {PriorityLabels[ticket.priority] || ticket.priority}
                          </span>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700 mb-2">{ticket.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${StateColors[ticket.state] || 'bg-gray-100'}`}>
                            {TicketStateLabels[ticket.state] || ticket.state}
                          </span>
                          <span className="text-gray-500">
                            Resolved: {ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        {suggestedResolution && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-900 mb-1">
                                  Suggested Resolution
                                </p>
                                <p className="text-sm text-green-800">
                                  {suggestedResolution}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Resolved by: {ticket.assigned_to_name || 'Unknown'} | 
                          Group: {ticket.assignment_group_name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Suggestion */}
        {analysis.hasSimilarTickets && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Recommended Action
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Review the suggested resolutions above and apply the appropriate solution. 
                  If the suggested resolution works, document it in the work notes and resolve the ticket. 
                  If not, you may need to escalate to the next level for further investigation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
