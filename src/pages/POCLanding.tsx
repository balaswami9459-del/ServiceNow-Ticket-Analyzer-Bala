import { useState } from 'react';
import type { UserRole } from '../types';
import { RoleLabels, RoleColors } from '../types';
import { 
  Headphones, 
  Briefcase, 
  Code, 
  Shield, 
  ArrowRight,
  FileText,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface POCLandingProps {
  onEnterPOC: (role: UserRole, name: string) => void;
}

const DEMO_USERS: Record<UserRole, string[]> = {
  'L1': ['Alice Johnson', 'Bob Smith', 'Carol White'],
  'L2': ['David Brown', 'Emma Davis', 'Frank Miller'],
  'L3': ['Grace Lee', 'Henry Wilson', 'Ivy Chen'],
  'admin': ['Admin User']
};

const ROLE_FEATURES: Record<UserRole, string[]> = {
  'L1': [
    'Handle password resets and account issues',
    'Resolve common software problems',
    'Escalate complex issues to L2/L3',
    'Basic hardware troubleshooting'
  ],
  'L2': [
    'Analyze business requirements',
    'Fix workflow and data issues',
    'Review access permissions',
    'Escalate technical issues to L3'
  ],
  'L3': [
    'Fix complex code and integration issues',
    'Handle security vulnerabilities',
    'Database performance optimization',
    'CI/CD pipeline maintenance'
  ],
  'admin': [
    'Full system administration',
    'User management',
    'System configuration',
    'Generate release notes'
  ]
};

export function POCLanding({ onEnterPOC }: POCLandingProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('L1');
  const [selectedName, setSelectedName] = useState<string>(DEMO_USERS['L1'][0]);
  const [isEntering, setIsEntering] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setSelectedName(DEMO_USERS[role][0]);
  };

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterPOC(selectedRole, selectedName);
    }, 500);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'L1': return Headphones;
      case 'L2': return Briefcase;
      case 'L3': return Code;
      case 'admin': return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ServiceNow Ticket Analyzer
          </h1>
          <p className="text-xl text-gray-600 mb-2">POC Demo Environment</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Dummy Data Environment - No Real ServiceNow Connection Required
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Level Support</h3>
            <p className="text-gray-600 text-sm">
              Experience L1, L2, and L3 support workflows with realistic escalation paths between tiers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tickets</h3>
            <p className="text-gray-600 text-sm">
              Pre-populated with realistic tickets across different priorities, categories, and resolution states.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Release Notes Generator</h3>
            <p className="text-gray-600 text-sm">
              Generate release notes organized by priority, with full audit trail of who resolved what.
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Role</h2>
            <p className="text-gray-600 mb-8">
              Choose which support tier you want to experience. Each role has different ticket queues and capabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {(Object.keys(RoleLabels) as UserRole[]).map((role) => {
                const Icon = getRoleIcon(role);
                const isSelected = selectedRole === role;
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? `border-current ${RoleColors[role].replace('bg-', 'border-').replace('100', '400')} bg-gray-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${RoleColors[role]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{RoleLabels[role]}</h3>
                    <p className="text-xs text-gray-500">
                      {role === 'L1' && 'First line support'}
                      {role === 'L2' && 'Business analysis'}
                      {role === 'L3' && 'Development & QA'}
                      {role === 'admin' && 'System administration'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${RoleColors[selectedRole]}`}>
                  {(() => {
                    const Icon = getRoleIcon(selectedRole);
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {RoleLabels[selectedRole]}
                  </h3>
                  <ul className="space-y-2">
                    {ROLE_FEATURES[selectedRole].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* User Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Demo User
                </label>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {DEMO_USERS[selectedRole].map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleEnter}
                disabled={isEntering}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isEntering ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entering...
                  </>
                ) : (
                  <>
                    Enter POC Environment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>This is a demonstration environment with dummy data.</p>
          <p>No connection to actual ServiceNow instance is required or made.</p>
        </div>
      </div>
    </div>
  );
}
