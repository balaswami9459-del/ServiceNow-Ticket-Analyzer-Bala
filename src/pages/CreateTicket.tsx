import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { getClient, isClientInitialized } from '../services/ServiceNowClient';
import { getMockService } from '../services/MockServiceNowService';
import { CreateTicketRequest, PriorityLabels, TicketStateLabels } from '../types';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateTicketRequest>({
    short_description: '',
    description: '',
    caller_id: '',
    priority: '4',
    urgency: '3',
    impact: '3',
    category: '',
    subcategory: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const isPOC = localStorage.getItem('poc-mode') === 'true';
      let ticket;
      
      if (isPOC) {
        const mockService = getMockService();
        ticket = await mockService.createTicket(formData);
      } else if (isClientInitialized()) {
        const client = getClient();
        ticket = await client.createTicket(formData);
      } else {
        throw new Error('No data source available. Please configure connection or enter POC mode.');
      }
      
      setSuccess(true);
      
      // Navigate to the new ticket after a brief delay
      setTimeout(() => {
        navigate(`/tickets/${ticket.sys_id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateTicketRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Ticket created successfully!</h3>
              <p className="text-sm text-green-700 mt-1">Redirecting to the ticket details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/tickets" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tickets
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Ticket</h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating ticket</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="short_description"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.short_description}
            onChange={(e) => handleChange('short_description', e.target.value)}
            placeholder="Brief summary of the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of the issue..."
          />
        </div>

        <div>
          <label htmlFor="caller_id" className="block text-sm font-medium text-gray-700">
            Caller ID (User Sys ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="caller_id"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.caller_id}
            onChange={(e) => handleChange('caller_id', e.target.value)}
            placeholder="User system ID"
          />
          <p className="mt-1 text-xs text-gray-500">Enter the system ID of the user reporting this issue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {Object.entries(PriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
              Urgency
            </label>
            <select
              id="urgency"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.urgency}
              onChange={(e) => handleChange('urgency', e.target.value)}
            >
              <option value="1">1 - High</option>
              <option value="2">2 - Medium</option>
              <option value="3">3 - Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
              Impact
            </label>
            <select
              id="impact"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.impact}
              onChange={(e) => handleChange('impact', e.target.value)}
            >
              <option value="1">1 - High</option>
              <option value="2">2 - Medium</option>
              <option value="3">3 - Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="category"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Software, Hardware, Network"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
            Subcategory
          </label>
          <input
            type="text"
            id="subcategory"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.subcategory}
            onChange={(e) => handleChange('subcategory', e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <Link
              to="/tickets"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
