import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getClient, initializeClient, isClientInitialized } from '../services/ServiceNowClient';
import { ServiceNowConfig } from '../types';

export default function Settings() {
  const [config, setConfig] = useState<ServiceNowConfig>({
    instanceUrl: '',
    username: '',
    password: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Format URL properly
      let formattedUrl = config.instanceUrl.trim();
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl.slice(0, -1);
      }

      const testClient = initializeClient({
        instanceUrl: formattedUrl,
        username: config.username.trim(),
        password: config.password.trim()
      });

      const isConnected = await testClient.testConnection();

      if (isConnected) {
        setTestResult({ success: true, message: 'Connection successful! Configuration updated.' });
      } else {
        setTestResult({ success: false, message: 'Failed to connect to ServiceNow. Please check your credentials.' });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your ServiceNow connection settings
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h3>
        <div className="flex items-center">
          {isClientInitialized() ? (
            <>
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700">Connected to ServiceNow</span>
            </>
          ) : (
            <>
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-700">Not connected</span>
            </>
          )}
        </div>
        {isClientInitialized() && (
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReconnecting ? 'animate-spin' : ''}`} />
            {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
        )}
      </div>

      {/* Connection Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Settings</h3>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleTestConnection(); }}>
          <div>
            <label htmlFor="instance-url" className="block text-sm font-medium text-gray-700">
              Instance URL
            </label>
            <input
              type="text"
              id="instance-url"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="dev12345.service-now.com"
              value={config.instanceUrl}
              onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your ServiceNow instance URL (with or without https://)
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="admin"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your ServiceNow password or API token
            </p>
          </div>

          {testResult && (
            <div
              className={`flex items-center p-4 rounded-md ${
                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isTesting || !config.instanceUrl || !config.username || !config.password}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Testing Connection...
                </>
              ) : (
                'Test & Update Connection'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Enter your ServiceNow instance URL (e.g., dev12345.service-now.com)</li>
          <li>Provide your ServiceNow username and password</li>
          <li>Click &quot;Test & Update Connection&quot; to verify your credentials</li>
          <li>Once connected, you can start managing tickets</li>
        </ul>
        <p className="mt-4 text-sm text-blue-700">
          <strong>Note:</strong> Your credentials are only used to authenticate with ServiceNow and are not stored permanently.
        </p>
      </div>
    </div>
  );
}
