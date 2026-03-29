import { useState, useEffect } from 'react';
import type { WorkNote, UserRole } from '../types';
import { RoleLabels, RoleColors } from '../types';
import { getMockService } from '../services/MockServiceNowService';

interface WorkNotesPanelProps {
  ticketId: string;
  allowAdd?: boolean;
  currentRole?: UserRole;
  currentUserName?: string;
  onNoteAdded?: () => void;
}

export function WorkNotesPanel({ 
  ticketId, 
  allowAdd = false, 
  currentRole = 'L1',
  currentUserName = 'Current User',
  onNoteAdded 
}: WorkNotesPanelProps) {
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    const service = getMockService();
    const workNotes = await service.getWorkNotes(ticketId);
    setNotes(workNotes);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, [ticketId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    const service = getMockService();
    
    // Set current user context before adding note
    service.setCurrentUser(currentUserName, currentRole);
    
    // Add note by updating ticket
    await service.updateTicket(ticketId, {
      work_notes: newNote
    });

    setNewNote('');
    await loadNotes();
    onNoteAdded?.();
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      {allowAdd && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Add Work Note</h4>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your work notes here..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none text-sm"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No work notes yet.</p>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id} 
              className={`border rounded-lg p-3 ${
                note.isEscalationNote 
                  ? 'border-orange-300 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{note.author}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${RoleColors[note.role]}`}>
                    {RoleLabels[note.role]}
                  </span>
                  {note.isEscalationNote && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Escalation
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
              </div>
              
              {note.isEscalationNote && note.escalationReason && (
                <div className="mb-2 text-xs text-orange-700 bg-orange-100 rounded px-2 py-1">
                  <strong>Reason:</strong> {note.escalationReason}
                </div>
              )}
              
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
