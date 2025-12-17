interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  cfAccessToken?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    labels?: string[];
    customfield_10016?: number;
    customfield_10040?: number;
    timetracking?: {
      timeSpentSeconds?: number;
    };
    parent?: {
      key: string;
      fields: {
        summary: string;
      };
    };
    issuetype: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    duedate?: string;
  };
}

export interface JiraEpic extends JiraIssue {
  fields: JiraIssue['fields'] & {
    customfield_10011?: string;
    [key: string]: any; // Allow any custom field to be accessed
  };
}

export class JiraApiService {
  private config: JiraConfig;
  private baseUrl: string;
  private proxyUrl: string;
  private isCloudInstance: boolean;

  constructor(config: JiraConfig) {
    this.config = config;
    const cleanDomain = config.domain.replace(/\/$/, '').replace(/^https?:\/\//, '');
    this.isCloudInstance = cleanDomain.includes('atlassian.net');
    const apiVersion = this.isCloudInstance ? '3' : '2';
    this.baseUrl = `https://${cleanDomain}/rest/api/${apiVersion}`;
    this.proxyUrl = '/api/jira-proxy';
  }

  private getAuthHeader(): string {
    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    return `Basic ${auth}`;
  }

  private async proxyRequest(url: string): Promise<any> {
    console.log('🔗 Proxy request to:', url);
    console.log('🔑 Auth config:', { 
      hasCfToken: !!this.config.cfAccessToken,
      cfTokenLength: this.config.cfAccessToken?.length,
      hasBasicAuth: !!this.config.apiToken 
    });
    
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        auth: this.getAuthHeader(),
        cfAccessClientId: this.config.cfAccessClientId,
        cfAccessClientSecret: this.config.cfAccessClientSecret,
        cfAccessToken: this.config.cfAccessToken,
      }),
    });

    console.log('📬 Proxy response status:', response.status);
    const result = await response.json();
    console.log('📬 Proxy result:', { ok: result.ok, status: result.status, hasData: !!result.data, error: result.error });

    if (!result.ok) {
      console.error('❌ Proxy error:', result);
      throw new Error(result.error || 'Proxy request failed');
    }

    return result.data;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.proxyRequest(`${this.baseUrl}/myself`);
      return true;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  async searchIssues(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      console.log('📡 Searching Jira with JQL:', jql);
      const data = await this.proxyRequest(
        `${this.baseUrl}/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=*all`
      );
      console.log('📦 Jira search response:', { total: data.total, issueCount: data.issues?.length, data });
      return data.issues || [];
    } catch (error) {
      console.error('❌ Failed to fetch Jira issues:', error);
      throw error;
    }
  }

  async getEpics(projectKey?: string, assignee?: string): Promise<JiraEpic[]> {
    let jql = 'issuetype = Epic';
    
    if (projectKey) {
      jql += ` AND project = ${projectKey}`;
    }
    
    // Only filter by assignee if explicitly specified (currentUser() doesn't work with CF Access)
    if (assignee) {
      jql += ` AND assignee = ${assignee}`;
    }
    
    jql += ' ORDER BY created DESC';
    
    console.log('🔍 JQL Query:', jql);

    // Limit to 20 most recent epics to avoid too many requests
    return this.searchIssues(jql, 20) as Promise<JiraEpic[]>;
  }

  async getIssuesByEpic(epicKey: string): Promise<JiraIssue[]> {
    const jql = `"Epic Link" = "${epicKey}" OR parent = "${epicKey}" ORDER BY created ASC`;
    return this.searchIssues(jql);
  }

  async getAllWorkloadData(projectKey?: string, assignee?: string): Promise<{
    epics: JiraEpic[];
    issuesByEpic: Map<string, JiraIssue[]>;
  }> {
    const epics = await this.getEpics(projectKey, assignee);
    const issuesByEpic = new Map<string, JiraIssue[]>();

    // Process epics sequentially to avoid too many parallel requests
    for (const epic of epics) {
      try {
        const issues = await this.getIssuesByEpic(epic.key);
        issuesByEpic.set(epic.key, issues);
      } catch (error) {
        console.error(`Failed to fetch issues for epic ${epic.key}:`, error);
        issuesByEpic.set(epic.key, []);
      }
    }

    return { epics, issuesByEpic };
  }
}
