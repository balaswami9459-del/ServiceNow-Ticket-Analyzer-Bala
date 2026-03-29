import { useState, useEffect } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, ChevronRight, RefreshCw, XCircle, Bot, Sparkles, Clock, ArrowUpRight } from 'lucide-react';
import type { ServiceNowTicket } from '../types';
import { PriorityColors, StateColors, PriorityLabels, TicketStateLabels } from '../types';
import { getMockService } from '../services/MockServiceNowService';
import { aiAgentService, type AIAnalysisResult } from '../services/AIAgentService';

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
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'similar'>('ai');

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

  const runAIAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    
    try {
      const mockService = getMockService();
      const ticket = await mockService.getTicket(ticketId);
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const similarTicketIds = analysis?.similarTickets.map(st => st.ticket.sys_id) || [];
      const similarTickets = await Promise.all(
        similarTicketIds.map(id => mockService.getTicket(id))
      );
      const validSimilarTickets = similarTickets.filter((t): t is ServiceNowTicket => t !== null);

      const result = await aiAgentService.analyzeTicket(ticket, validSimilarTickets);
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI Analysis error:', err);
      setAiError(err instanceof Error ? err.message : 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      runAnalysis();
      runAIAnalysis();
    }
  }, [ticketId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getRelevanceBadge = (score: number) => {
    if (score >= 70) return { color: 'bg-green-100 text-green-800', label: 'High Match' };
    if (score >= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Match' };
    return { color: 'bg-blue-100 text-blue-800', label: 'Related' };
  };

  if (loading && aiLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <div>
            <span className="font-medium">AI is analyzing this ticket...</span>
            <p className="text-sm text-gray-500">Checking similar tickets and generating insights</p>
          </div>
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
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                AI-Powered Analysis
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h3>
              <p className="text-sm text-gray-600">
                {aiAnalysis ? 'Intelligent insights based on ticket patterns' : 'Analyzing ticket...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { runAnalysis(); runAIAnalysis(); }}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              title="Re-run analysis"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Insights
            </div>
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'similar'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Similar Tickets
              {analysis?.similarTickets.length ? `(${analysis.similarTickets.length})` : ''}
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'ai' ? (
          <div className="space-y-6">
            {aiError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{aiError}</span>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Make sure you have set your OpenAI API key in the environment variables (VITE_OPENAI_API_KEY).
                </p>
              </div>
            ) : aiAnalysis ? (
              <>
                {/* Classification & Escalation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      AI Classification
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-medium text-gray-900">{aiAnalysis.classification.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subcategory</span>
                        <span className="text-sm font-medium text-gray-900">{aiAnalysis.classification.subcategory}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Priority</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${PriorityColors[aiAnalysis.classification.priority] || 'bg-gray-100'}`}>
                          {PriorityLabels[aiAnalysis.classification.priority] || aiAnalysis.classification.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getConfidenceColor(aiAnalysis.classification.confidence)}`}>
                          {Math.round(aiAnalysis.classification.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Resolution Estimate
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{aiAnalysis.estimatedResolutionTime}</span>
                      </div>
                      {aiAnalysis.escalationRecommended && (
                        <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                          <ArrowUpRight className="w-4 h-4" />
                          <span className="text-sm font-medium">Escalation Recommended</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested Resolution */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggested Resolution
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed">{aiAnalysis.suggestedResolution}</p>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions</h4>
                  <div className="space-y-2">
                    {aiAnalysis.recommendedActions.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Patterns */}
                {aiAnalysis.similarPatterns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Similar Patterns Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.similarPatterns.map((pattern, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">AI Reasoning:</span> {aiAnalysis.reasoning}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Generating AI insights...</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            {error ? (
              <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            ) : analysis ? (
              !analysis.hasSimilarTickets ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <XCircle className="w-12 h-12 text-blue-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    No Reference Tickets Found
                  </h4>
                  <p className="text-gray-600 max-w-md">
                    This appears to be a unique issue with no similar resolved tickets in the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {analysis.analysisMessage}
                  </p>
                  
                  {analysis.similarTickets.map(({ ticket, relevanceScore, suggestedResolution }) => {
                    const badge = getRelevanceBadge(relevanceScore);
                    const isExpanded = expandedTicket === ticket.sys_id;
                    
                    return (
                      <div
                        key={ticket.sys_id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
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
                              </div>
                            </div>
                            <ChevronRight 
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} 
                            />
                          </div>
                        </div>

                        {isExpanded && suggestedResolution && (
                          <div className="border-t border-gray-200 bg-green-50 p-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-900 mb-1">
                                  Resolution Applied
                                </p>
                                <p className="text-sm text-green-800">{suggestedResolution}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
