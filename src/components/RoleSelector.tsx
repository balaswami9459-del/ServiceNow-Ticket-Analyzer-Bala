import { useState } from 'react';
import type { UserRole } from '../types';
import { RoleLabels, RoleColors } from '../types';

interface RoleSelectorProps {
  currentRole: UserRole | null;
  onRoleChange: (role: UserRole, name: string) => void;
}

const DEMO_USERS: Record<UserRole, string[]> = {
  'L1': ['Alice Johnson', 'Bob Smith', 'Carol White'],
  'L2': ['David Brown', 'Emma Davis', 'Frank Miller'],
  'L3': ['Grace Lee', 'Henry Wilson', 'Ivy Chen'],
  'admin': ['Admin User']
};

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'L1');
  const [selectedName, setSelectedName] = useState<string>(
    currentRole ? DEMO_USERS[currentRole][0] : DEMO_USERS['L1'][0]
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setSelectedName(DEMO_USERS[role][0]);
  };

  const handleNameChange = (name: string) => {
    setSelectedName(name);
  };

  const handleConfirm = () => {
    onRoleChange(selectedRole, selectedName);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm text-gray-600">Current Role:</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${RoleColors[currentRole || 'L1']}`}>
          {RoleLabels[currentRole || 'L1']}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {currentRole ? DEMO_USERS[currentRole][0] : 'Select Role'}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Role for POC</h3>
      
      {/* Role Selection */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-700 uppercase">Role</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RoleLabels) as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedRole === role
                  ? RoleColors[role]
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {RoleLabels[role]}
            </button>
          ))}
        </div>
      </div>

      {/* User Selection */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-700 uppercase">Select User</label>
        <select
          value={selectedName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {DEMO_USERS[selectedRole].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsExpanded(false)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Switch Role
        </button>
      </div>

      {/* Role Description */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong className="block text-gray-900 mb-1">
          {RoleLabels[selectedRole]}:
        </strong>
        {selectedRole === 'L1' && 'Handle basic inquiries, password resets, and simple technical issues.'}
        {selectedRole === 'L2' && 'Analyze business requirements, workflow issues, and data problems.'}
        {selectedRole === 'L3' && 'Handle complex technical issues, code fixes, security, and infrastructure.'}
        {selectedRole === 'admin' && 'Full system access and administrative functions.'}
      </div>
    </div>
  );
}
