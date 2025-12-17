interface JiraWriteConfig {
  domain: string;
  email: string;
  apiToken: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
}

export class JiraWriteService {
  private baseUrl: string;
  private proxyUrl = 'http://localhost:3001/api/jira-proxy';
  private config: JiraWriteConfig;
  
  constructor(config: JiraWriteConfig) {
    this.config = config;
    const cleanDomain = config.domain.replace(/\/$/, '').replace(/^https?:\/\//, '');
    const isCloudInstance = cleanDomain.includes('atlassian.net');
    const apiVersion = isCloudInstance ? '3' : '2';
    this.baseUrl = `https://${cleanDomain}/rest/api/${apiVersion}`;
  }

  private getAuthHeader(): string {
    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    return `Basic ${auth}`;
  }

  async createIssue(issueData: {
    summary: string;
    description?: any;
    issuetype: { name: string };
    project: { key: string };
    parent?: { key: string };
    customfield_10016?: number; // Story points (some Jira instances)
    customfield_10040?: number; // Story points (this Jira instance)
    [key: string]: any; // Allow any custom field
  }): Promise<{ key: string; id: string }> {
    try {
      const response = await fetch(`${this.proxyUrl}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: this.baseUrl.replace(/\/rest\/api\/\d+$/, ''),
          auth: this.getAuthHeader(),
          cfAccessClientId: this.config.cfAccessClientId,
          cfAccessClientSecret: this.config.cfAccessClientSecret,
          issueData: { fields: issueData }
        })
      });

      const result = await response.json();
      console.log('🔍 Create issue response:', result);
      
      if (!result.ok) {
        console.error('❌ Jira API error details:', result.data);
        const errorMsg = result.data?.errorMessages?.[0] || result.data?.errors || 'Failed to create issue';
        throw new Error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error creating Jira issue:', error);
      throw error;
    }
  }

  async updateIssue(issueKey: string, updateData: {
    summary?: string;
    description?: any;
    customfield_10016?: number;
    customfield_10040?: number;
    [key: string]: any;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.proxyUrl}/issue/${issueKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: this.baseUrl.replace(/\/rest\/api\/\d+$/, ''),
          auth: this.getAuthHeader(),
          cfAccessClientId: this.config.cfAccessClientId,
          cfAccessClientSecret: this.config.cfAccessClientSecret,
          updateData: { fields: updateData }
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating Jira issue:', error);
      throw error;
    }
  }

  async getTransitions(issueKey: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${this.baseUrl}/issue/${issueKey}/transitions`,
          auth: this.getAuthHeader()
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error('Failed to get transitions');
      }

      return result.data?.transitions || [];
    } catch (error) {
      console.error('Error getting Jira transitions:', error);
      throw error;
    }
  }

  async updateIssueStatus(issueKey: string, targetStatus: string): Promise<void> {
    try {
      // Get available transitions for this issue
      const transitions = await this.getTransitions(issueKey);
      
      // Map dashboard statuses to Jira transition names
      const statusMapping: Record<string, string[]> = {
        'Backlog': ['To Do', 'Backlog', 'Open'],
        'In Progress': ['In Progress', 'Start Progress'],
        'Blocked': ['Blocked', 'Block'],
        'In Review': ['In Review', 'Code Review', 'Review'],
        'Done': ['Done', 'Close', 'Closed', 'Resolve', 'Resolved']
      };

      const possibleNames = statusMapping[targetStatus] || [targetStatus];
      
      // Find matching transition
      const transition = transitions.find(t => 
        possibleNames.some(name => t.name.toLowerCase().includes(name.toLowerCase()))
      );

      if (!transition) {
        console.warn(`No transition found for status "${targetStatus}". Available:`, transitions.map(t => t.name));
        return;
      }

      console.log(`Executing transition: ${transition.name} (ID: ${transition.id})`);

      // Execute transition
      const transitionResponse = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${this.baseUrl}/issue/${issueKey}/transitions`,
          auth: this.getAuthHeader(),
          cfAccessClientId: this.config.cfAccessClientId,
          cfAccessClientSecret: this.config.cfAccessClientSecret,
          method: 'POST',
          body: { transition: { id: transition.id } }
        })
      });

      const result = await transitionResponse.json();
      
      if (!result.ok) {
        console.error('Transition failed:', result);
        throw new Error('Failed to update issue status');
      }
      
      console.log(`Successfully transitioned ${issueKey} to ${targetStatus}`);
    } catch (error) {
      console.error('Error updating Jira issue status:', error);
      throw error;
    }
  }

  async deleteIssue(issueKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.proxyUrl}/issue/${issueKey}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: this.baseUrl.replace(/\/rest\/api\/\d+$/, ''),
          auth: this.getAuthHeader(),
          cfAccessClientId: this.config.cfAccessClientId,
          cfAccessClientSecret: this.config.cfAccessClientSecret
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error('Failed to delete issue');
      }
    } catch (error) {
      console.error('Error deleting Jira issue:', error);
      throw error;
    }
  }
}
