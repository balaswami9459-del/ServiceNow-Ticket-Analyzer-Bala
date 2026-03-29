import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Edit2,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Flag,
  Tag
} from 'lucide-react';
import { getClient, isClientInitialized } from '../services/ServiceNowClient';
import { getMockService } from '../services/MockServiceNowService';
import { ServiceNowTicket, TicketStateLabels, PriorityLabels, StateColors, PriorityColors, UpdateTicketRequest } from '../types';
import { TicketAnalysis } from '../components/TicketAnalysis';

export default function TicketDetail() {
  const { sysId } = useParams<{ sysId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ServiceNowTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editedTicket, setEditedTicket] = useState<UpdateTicketRequest>({});
  const [workNotes, setWorkNotes] = useState('');

  useEffect(() => {
    loadTicket();
  }, [sysId]);

  const loadTicket = async () => {
    if (!sysId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const isPOC = localStorage.getItem('poc-mode') === 'true';
      let data;
      
      if (isPOC) {
        const mockService = getMockService();
        data = await mockService.getTicket(sysId);
      } else if (isClientInitialized()) {
        const client = getClient();
        data = await client.getTicket(sysId);
      } else {
        throw new Error('No data source available. Please configure connection or enter POC mode.');
      }
      
      setTicket(data);
      if (data) {
        setEditedTicket({
          short_description: data.short_description,
          description: data.description,
          state: data.state,
          priority: data.priority,
          assigned_to: data.assigned_to
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sysId || !ticket) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const isPOC = localStorage.getItem('poc-mode') === 'true';
      const updates: UpdateTicketRequest = { ...editedTicket };
      
      if (workNotes.trim()) {
        updates.work_notes = workNotes.trim();
      }

      let updated;
      if (isPOC) {
        const mockService = getMockService();
        updated = await mockService.updateTicket(sysId, updates);
      } else {
        const client = getClient();
        updated = await client.updateTicket(sysId, updates);
      }
      
      setTicket(updated);
      setSaveSuccess(true);
      setIsEditing(false);
      setWorkNotes('');
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/tickets" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tickets
        </Link>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found.</p>
        <Link to="/tickets" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tickets" className="text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{ticket.number}</h1>
            <p className="text-sm text-gray-500">Incident Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Ticket updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
      {/* Ticket Analysis - Only show for New tickets */}
          {ticket.state === '1' && (
            <TicketAnalysis 
              ticketId={ticket.sys_id} 
              ticketCategory={ticket.category} 
            />
          )}

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedTicket.short_description || ''}
                    onChange={(e) => setEditedTicket({ ...editedTicket, short_description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={6}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedTicket.description || ''}
                    onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add work notes..."
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">{ticket.short_description}</h4>
                </div>
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {ticket.description || 'No description provided.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Priority</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                {isEditing ? (
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={editedTicket.state || ''}
                    onChange={(e) => setEditedTicket({ ...editedTicket, state: e.target.value })}
                  >
                    {Object.entries(TicketStateLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${StateColors[ticket.state]}`}>
                    {TicketStateLabels[ticket.state]}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                {isEditing ? (
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={editedTicket.priority || ''}
                    onChange={(e) => setEditedTicket({ ...editedTicket, priority: e.target.value })}
                  >
                    {Object.entries(PriorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PriorityColors[ticket.priority]}`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {PriorityLabels[ticket.priority]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Caller</p>
                  <p className="text-sm text-gray-500">{ticket.caller_name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Assigned To</p>
                  <p className="text-sm text-gray-500">{ticket.assigned_to_name || 'Unassigned'}</p>
                </div>
              </div>
              {ticket.assignment_group_name && (
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assignment Group</p>
                    <p className="text-sm text-gray-500">{ticket.assignment_group_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Opened</p>
                  <p className="text-sm text-gray-500">{formatDate(ticket.opened_at)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">{formatDate(ticket.sys_updated_on)}</p>
                </div>
              </div>
              {ticket.resolved_at && (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resolved</p>
                    <p className="text-sm text-gray-500">{formatDate(ticket.resolved_at)}</p>
                  </div>
                </div>
              )}
              {ticket.closed_at && (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Closed</p>
                    <p className="text-sm text-gray-500">{formatDate(ticket.closed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
