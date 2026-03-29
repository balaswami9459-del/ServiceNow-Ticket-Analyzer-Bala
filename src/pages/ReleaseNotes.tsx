import { useState } from 'react';
import type { ReleaseNote, UserRole } from '../types';
import { PriorityLabels, RoleLabels, RoleColors } from '../types';
import { getMockService } from '../services/MockServiceNowService';

export function ReleaseNotesGenerator() {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const service = getMockService();
    
    const notes = await service.generateReleaseNotes(
      priority || null,
      startDate,
      endDate
    );
    
    setReleaseNotes(notes);
    setGenerated(true);
    setLoading(false);
  };

  const groupByRole = (notes: ReleaseNote[]) => {
    const grouped: Record<UserRole, ReleaseNote[]> = {
      'L1': [],
      'L2': [],
      'L3': [],
      'admin': []
    };
    
    notes.forEach(note => {
      grouped[note.role].push(note);
    });
    
    return grouped;
  };

  const groupByPriority = (notes: ReleaseNote[]) => {
    const grouped: Record<string, ReleaseNote[]> = {};
    
    notes.forEach(note => {
      if (!grouped[note.priority]) {
        grouped[note.priority] = [];
      }
      grouped[note.priority].push(note);
    });
    
    return grouped;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupedByRole = groupByRole(releaseNotes);
  const groupedByPriority = groupByPriority(releaseNotes);

  const copyToClipboard = () => {
    const text = generateMarkdown();
    navigator.clipboard.writeText(text);
    alert('Release notes copied to clipboard!');
  };

  const generateMarkdown = () => {
    const sections: string[] = [];
    
    sections.push(`# Release Notes`);
    sections.push(`**Period:** ${formatDate(startDate)} - ${formatDate(endDate)}`);
    sections.push(`**Total Resolved Tickets:** ${releaseNotes.length}`);
    sections.push('');

    // Group by priority (Critical/High first)
    const priorityOrder = ['1', '2', '3', '4', '5'];
    priorityOrder.forEach(p => {
      const notes = groupedByPriority[p];
      if (notes && notes.length > 0) {
        sections.push(`## ${PriorityLabels[p]} Priority (${notes.length})`);
        notes.forEach(note => {
          sections.push(`- **${note.ticketNumber}**: ${note.shortDescription}`);
          sections.push(`  - Category: ${note.category}`);
          sections.push(`  - Resolved by: ${RoleLabels[note.role]} (${note.resolvedBy})`);
          sections.push(`  - Resolution: ${note.resolutionNotes}`);
          sections.push('');
        });
      }
    });

    return sections.join('\n');
  };

  const downloadAsFile = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release-notes-${startDate}-to-${endDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Release Notes Generator</h1>
        <p className="text-gray-600">Generate release notes from resolved tickets based on date range and priority</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority Filter (Optional)</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {Object.entries(PriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Release Notes'}
        </button>
      </div>

      {/* Results */}
      {generated && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Copy Markdown
                </button>
                <button
                  onClick={downloadAsFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Download .md
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{releaseNotes.length}</div>
                <div className="text-sm text-gray-600">Total Resolved</div>
              </div>
              {(['L1', 'L2', 'L3'] as UserRole[]).map(role => (
                <div key={role} className="bg-gray-50 p-4 rounded">
                  <div className="text-2xl font-bold text-gray-900">{groupedByRole[role].length}</div>
                  <div className="text-sm text-gray-600">{RoleLabels[role]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Release Notes by Priority */}
          {Object.entries(groupedByPriority)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([prio, notes]) => {
              if (notes.length === 0) return null;
              const colors: Record<string, string> = {
                '1': 'border-red-200 bg-red-50',
                '2': 'border-orange-200 bg-orange-50',
                '3': 'border-yellow-200 bg-yellow-50',
                '4': 'border-blue-200 bg-blue-50',
                '5': 'border-gray-200 bg-gray-50'
              };
              
              return (
                <div key={prio} className={`bg-white rounded-lg border ${colors[prio]} overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${colors[prio]}`}>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {PriorityLabels[prio]} Priority
                      <span className="ml-2 text-sm font-normal text-gray-600">({notes.length} tickets)</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {notes.map((note) => (
                      <div key={note.id} className="p-6 hover:bg-white/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-blue-600">{note.ticketNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${RoleColors[note.role]}`}>
                              {RoleLabels[note.role]}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(note.resolvedAt)}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{note.shortDescription}</h4>
                        <p className="text-sm text-gray-600 mb-2"><strong>Category:</strong> {note.category}</p>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-sm text-gray-700">
                            <strong>Resolution:</strong> {note.resolutionNotes}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Resolved by: {note.resolvedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Empty State */}
          {releaseNotes.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No resolved tickets found for the selected criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
