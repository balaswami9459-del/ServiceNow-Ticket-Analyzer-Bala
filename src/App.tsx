import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { UserRole } from './types';
import Layout from './components/Layout';
import { POCLayout } from './components/POCLayout';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import Settings from './pages/Settings';
import ConnectionSetup from './pages/ConnectionSetup';
import { POCLanding } from './pages/POCLanding';
import { L1Queue } from './pages/L1Queue';
import { L2Queue } from './pages/L2Queue';
import { L3Queue } from './pages/L3Queue';
import { ReleaseNotesGenerator } from './pages/ReleaseNotes';
import { TicketSearch } from './pages/TicketSearch';
import { isClientInitialized } from './services/ServiceNowClient';
import { getMockService } from './services/MockServiceNowService';

type AppMode = 'landing' | 'poc' | 'connected';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('L1');
  const [currentUserName, setCurrentUserName] = useState<string>('Alice Johnson');

  useEffect(() => {
    const pocMode = localStorage.getItem('poc-mode');
    const savedRole = localStorage.getItem('poc-role') as UserRole;
    const savedUser = localStorage.getItem('poc-user');
    
    if (pocMode === 'true' && savedRole && savedUser) {
      setAppMode('poc');
      setCurrentRole(savedRole);
      setCurrentUserName(savedUser);
      getMockService().setCurrentUser(savedUser, savedRole);
    } else if (isClientInitialized()) {
      setAppMode('connected');
    }
    
    setIsLoading(false);
  }, []);

  const handleEnterPOC = (role: UserRole, name: string) => {
    setCurrentRole(role);
    setCurrentUserName(name);
    setAppMode('poc');
    
    localStorage.setItem('poc-mode', 'true');
    localStorage.setItem('poc-role', role);
    localStorage.setItem('poc-user', name);
    
    getMockService().setCurrentUser(name, role);
  };

  const handleExitPOC = () => {
    setAppMode('landing');
    localStorage.removeItem('poc-mode');
    localStorage.removeItem('poc-role');
    localStorage.removeItem('poc-user');
  };

  const handleRoleChange = (role: UserRole, name: string) => {
    setCurrentRole(role);
    setCurrentUserName(name);
    localStorage.setItem('poc-role', role);
    localStorage.setItem('poc-user', name);
    getMockService().setCurrentUser(name, role);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (appMode === 'landing') {
    return <POCLanding onEnterPOC={handleEnterPOC} />;
  }

  if (appMode === 'poc') {
    const getQueueComponent = () => {
      switch (currentRole) {
        case 'L1':
          return <L1Queue role={currentRole} userName={currentUserName} />;
        case 'L2':
          return <L2Queue role={currentRole} userName={currentUserName} />;
        case 'L3':
        case 'admin':
          return <L3Queue role={currentRole} userName={currentUserName} />;
        default:
          return <L1Queue role={currentRole} userName={currentUserName} />;
      }
    };

    return (
      <POCLayout 
        currentRole={currentRole}
        currentUserName={currentUserName}
        onRoleChange={handleRoleChange}
        onExitPOC={handleExitPOC}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queue" element={getQueueComponent()} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:sysId" element={<TicketDetail />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/search" element={<TicketSearch />} />
          <Route path="/release-notes" element={<ReleaseNotesGenerator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </POCLayout>
    );
  }

  if (!isClientInitialized()) {
    return <ConnectionSetup onComplete={() => setAppMode('connected')} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:sysId" element={<TicketDetail />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
