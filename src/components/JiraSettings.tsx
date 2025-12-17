import { useState } from 'react';
import { Settings, CheckCircle, XCircle, Loader, ChevronDown } from 'lucide-react';

interface JiraSettingsProps {
  onConnect: (config: JiraConfig) => void;
  onDisconnect?: () => void;
  isConnected: boolean;
}

interface JiraConnectionFormProps {
  onConnect: (config: JiraConfig) => void;
  isConnected: boolean;
  embedded?: boolean;
}

export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey?: string;
  assignee?: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  cfAccessToken?: string;
}

// Exported form component for embedding in empty state
export const JiraConnectionForm = ({ onConnect, isConnected, embedded = false }: JiraConnectionFormProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [cfAuthMethod, setCfAuthMethod] = useState<'token' | 'service'>(
    localStorage.getItem('jira_cf_client_id') ? 'service' : 'token'
  );
  const [config, setConfig] = useState<JiraConfig>({
    domain: localStorage.getItem('jira_domain') || '',
    email: localStorage.getItem('jira_email') || '',
    apiToken: localStorage.getItem('jira_token') || '',
    projectKey: localStorage.getItem('jira_project') || '',
    assignee: localStorage.getItem('jira_assignee') || '',
    cfAccessClientId: localStorage.getItem('jira_cf_client_id') || '',
    cfAccessClientSecret: localStorage.getItem('jira_cf_client_secret') || '',
    cfAccessToken: localStorage.getItem('jira_cf_access_token') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);

    localStorage.setItem('jira_domain', config.domain);
    localStorage.setItem('jira_email', config.email);
    localStorage.setItem('jira_token', config.apiToken);
    localStorage.setItem('jira_project', config.projectKey || '');
    localStorage.setItem('jira_assignee', config.assignee || '');
    localStorage.setItem('jira_cf_client_id', config.cfAccessClientId || '');
    localStorage.setItem('jira_cf_client_secret', config.cfAccessClientSecret || '');
    localStorage.setItem('jira_cf_access_token', config.cfAccessToken || '');

    await onConnect(config);
    setIsTesting(false);
  };

  return (
    <div className={embedded ? '' : 'bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto'}>
      {!embedded && (
        <>
          {isConnected ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm">Connected to Jira</span>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 text-sm">Not connected</span>
            </div>
          )}
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jira Domain *
          </label>
          <input
            type="text"
            value={config.domain}
            onChange={(e) => setConfig({ ...config, domain: e.target.value })}
            placeholder="jira.cfdata.org"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Jira domain (without https://)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            placeholder="your-email@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Token *
          </label>
          <input
            type="password"
            value={config.apiToken}
            onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
            placeholder="Your Jira API token"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            <a
              href="https://jira.cfdata.org/plugins/servlet/de.resolution.apitokenauth/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Create API token here
            </a>
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Cloudflare Access *</p>
          <p className="text-xs text-gray-500 mb-3">Required for accessing jira.cfdata.org</p>
          
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setCfAuthMethod('service')}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                cfAuthMethod === 'service'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Service Token (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setCfAuthMethod('token')}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                cfAuthMethod === 'token'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Access Token (Local only)
            </button>
          </div>

          {cfAuthMethod === 'service' ? (
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={config.cfAccessClientId}
                  onChange={(e) => setConfig({ ...config, cfAccessClientId: e.target.value })}
                  placeholder="CF-Access-Client-Id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={config.cfAccessClientSecret}
                  onChange={(e) => setConfig({ ...config, cfAccessClientSecret: e.target.value })}
                  placeholder="CF-Access-Client-Secret"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showTokenHelp ? 'rotate-180' : ''}`} />
                How to create a Service Token
              </button>
              {showTokenHelp && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to Cloudflare Zero Trust Dashboard</li>
                    <li>Navigate to Access → Service Auth</li>
                    <li>Create a new Service Token</li>
                    <li>Copy the Client ID and Client Secret</li>
                    <li>Paste them above</li>
                  </ol>
                  <p className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded">
                    ✓ Service tokens don't expire and work for deployed apps.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
              <input
                type="password"
                value={config.cfAccessToken}
                onChange={(e) => setConfig({ ...config, cfAccessToken: e.target.value })}
                placeholder="Paste token here"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showTokenHelp ? 'rotate-180' : ''}`} />
                How to get your token
              </button>
              {showTokenHelp && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Open Terminal</li>
                    <li>Run: <code className="bg-blue-100 px-1 rounded">cloudflared access login jira.cfdata.org</code></li>
                    <li>Log in with your Cloudflare credentials</li>
                    <li>Run: <code className="bg-blue-100 px-1 rounded">cloudflared access token -app jira.cfdata.org</code></li>
                    <li>Copy the token and paste it above</li>
                  </ol>
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    ⚠️ Access tokens only work locally. Use Service Token for deployed apps.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Optional Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Project Key
                </label>
                <input
                  type="text"
                  value={config.projectKey}
                  onChange={(e) => setConfig({ ...config, projectKey: e.target.value })}
                  placeholder="e.g., PROJ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Assignee (username)
                </label>
                <input
                  type="text"
                  value={config.assignee}
                  onChange={(e) => setConfig({ ...config, assignee: e.target.value })}
                  placeholder="e.g., currentUser()"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isTesting || !config.domain || !config.email || !config.apiToken || 
            (cfAuthMethod === 'service' ? (!config.cfAccessClientId || !config.cfAccessClientSecret) : !config.cfAccessToken)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTesting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect to Jira'
          )}
        </button>
      </form>
    </div>
  );
};

export const JiraSettings = ({ onConnect, onDisconnect, isConnected }: JiraSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDisconnect = () => {
    localStorage.removeItem('jira_domain');
    localStorage.removeItem('jira_email');
    localStorage.removeItem('jira_token');
    localStorage.removeItem('jira_project');
    localStorage.removeItem('jira_assignee');
    localStorage.removeItem('jira_cf_client_id');
    localStorage.removeItem('jira_cf_client_secret');
    localStorage.removeItem('jira_cf_access_token');
    onDisconnect?.();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title="Jira Settings"
        data-jira-settings
      >
        <Settings className="w-5 h-5 text-gray-700" />
        {isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Jira Connection</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {isConnected && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 text-sm">Connected to Jira</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Disconnect
                </button>
              </div>
            )}
            <JiraConnectionForm onConnect={(config) => { onConnect(config); setIsOpen(false); }} isConnected={isConnected} embedded />
          </div>
        </div>
      )}
    </>
  );
};
