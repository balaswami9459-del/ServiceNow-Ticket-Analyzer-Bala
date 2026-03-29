import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Play,
  Search
} from 'lucide-react';
import type { UserRole } from '../types';
import { RoleLabels, RoleColors } from '../types';
import { RoleSelector } from './RoleSelector';

interface POCLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  currentUserName: string;
  onRoleChange: (role: UserRole, name: string) => void;
  onExitPOC: () => void;
}

export function POCLayout({ 
  children, 
  currentRole, 
  currentUserName, 
  onRoleChange,
  onExitPOC 
}: POCLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'My Queue', href: '/queue', icon: Ticket },
      { name: 'Tickets', href: '/tickets', icon: Ticket },
      { name: 'Search', href: '/search', icon: Search },
      { name: 'Release Notes', href: '/release-notes', icon: FileText },
    ];
    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* POC Mode Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="font-medium text-sm">POC Mode - Dummy Data Environment</span>
          </div>
          <div className="flex items-center gap-4">
            <RoleSelector 
              currentRole={currentRole} 
              onRoleChange={onRoleChange} 
            />
            <button
              onClick={onExitPOC}
              className="text-sm text-white/80 hover:text-white flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Exit POC
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-blue-600">POC Ticket Manager</h1>
            </div>
            
            {/* Current User Info */}
            <div className="mx-4 mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Current User</p>
              <p className="font-medium text-gray-900">{currentUserName}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${RoleColors[currentRole]}`}>
                {RoleLabels[currentRole]}
              </span>
            </div>

            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 flex-shrink-0 h-6 w-6" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-12">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-blue-600">POC Ticket Manager</h1>
            </div>
            
            {/* Current User Info */}
            <div className="mx-4 mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Current User</p>
              <p className="font-medium text-gray-900 text-sm">{currentUserName}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${RoleColors[currentRole]}`}>
                {RoleLabels[currentRole]}
              </span>
            </div>

            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 pt-12 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-12 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Breadcrumb */}
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <div className="flex items-center">
                      <Link to="/" className="text-gray-400 hover:text-gray-500">
                        Home
                      </Link>
                    </div>
                  </li>
                  {location.pathname !== '/' && (
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-4 text-sm font-medium text-gray-500 capitalize">
                          {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                        </span>
                      </div>
                    </li>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
