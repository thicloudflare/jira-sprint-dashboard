import express from 'express';
import cors from 'cors';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Configure to bypass SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/toolkit-proxy/phases', async (req, res) => {
  try {
    console.log('Fetching phases from workers.dev...');
    const response = await fetch('https://ai-design-workflow.thi-s-ent-account.workers.dev/api/phases');
    
    if (!response.ok) {
      throw new Error(`Workers API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched phases');
    res.json(data);
  } catch (error) {
    console.error('Toolkit proxy error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post('/api/jira-proxy', async (req, res) => {
  try {
    const { url, auth, cfAccessClientId, cfAccessClientSecret, cfAccessToken, method = 'GET', body } = req.body;
    
    // Use env vars as fallback (like internal-app-kit)
    const envCfToken = process.env.JIRA_CF_ACCESS_TOKEN;
    const envCfClientId = process.env.JIRA_CF_ACCESS_CLIENT_ID;
    const envCfClientSecret = process.env.JIRA_CF_ACCESS_CLIENT_SECRET;
    
    const effectiveCfToken = cfAccessToken || envCfToken;
    const effectiveCfClientId = cfAccessClientId || envCfClientId;
    const effectiveCfClientSecret = cfAccessClientSecret || envCfClientSecret;
    
    console.log('Proxy request to:', url);
    console.log('Method:', method);
    console.log('CF Access:', effectiveCfToken ? 'JWT Token' : (effectiveCfClientId ? 'Service Token' : 'Not provided'));
    console.log('Token source:', cfAccessToken ? 'client' : (envCfToken ? 'env' : 'none'));
    console.log('Token length:', effectiveCfToken?.length || 0);
    console.log('Token preview:', effectiveCfToken?.substring(0, 20) + '...' || 'none');

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'curl/8.0',
    };

    // CF Access authentication (for cfdata.org) - don't use Basic Auth with CF Access
    if (effectiveCfToken) {
      headers['CF-Access-Token'] = effectiveCfToken;
      console.log('Using CF-Access-Token header');
    } else if (effectiveCfClientId && effectiveCfClientSecret) {
      headers['CF-Access-Client-Id'] = effectiveCfClientId;
      headers['CF-Access-Client-Secret'] = effectiveCfClientSecret;
    } else if (auth) {
      // Only use Basic Auth for standard Atlassian Cloud (no CF Access)
      headers['Authorization'] = auth;
    }

    // Use curl directly since Node.js fetch has issues with CF Access
    // Get fresh token from cloudflared if CF Access is needed
    if (effectiveCfToken || url.includes('jira.cfdata.org')) {
      try {
        console.log('Getting fresh CF Access token from cloudflared...');
        const freshToken = execSync('cloudflared access token -app jira.cfdata.org 2>/dev/null', { encoding: 'utf-8' }).trim();
        console.log('Fresh token length:', freshToken.length);
        
        console.log('Using curl for CF Access request');
        const curlHeaders = [
          '-H', 'Content-Type: application/json',
          '-H', 'Accept: application/json',
          '-H', `CF-Access-Token: ${freshToken}`,
        ];
        
        if (body && method !== 'GET') {
          curlHeaders.push('-d', typeof body === 'string' ? body : JSON.stringify(body));
        }
        
        const curlCmd = `curl -s -L -X ${method} ${curlHeaders.map(h => `'${h}'`).join(' ')} '${url}'`;
        const result = execSync(curlCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        
        console.log('Curl response (first 200 chars):', result.substring(0, 200));
        
        let data;
        try {
          data = JSON.parse(result);
        } catch {
          data = { 
            error: 'Jira returned non-JSON response',
            preview: result.substring(0, 500)
          };
          return res.json({ ok: false, error: data.error, data });
        }
        
        return res.json({ ok: true, data });
      } catch (curlError) {
        console.error('Curl error:', curlError.message);
        return res.status(500).json({ ok: false, error: curlError.message });
      }
    }

    const fetchOptions = {
      method,
      headers,
      ...(body && method !== 'GET' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {})
    };

    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type');
    console.log('Response status:', response.status);
    console.log('Content-Type:', contentType);
    
    let data;
    const text = await response.text();
    
    if (contentType && contentType.includes('application/json')) {
      data = text ? JSON.parse(text) : {};
    } else {
      console.log('Received HTML/text response (first 500 chars):', text.substring(0, 500));
      data = { 
        error: 'Jira returned HTML instead of JSON. This usually means authentication failed or the endpoint is incorrect.',
        statusCode: response.status,
        preview: text.substring(0, 500)
      };
    }
    
    if (!response.ok) {
      console.error('Jira API error:', data);
    }

    res.json({
      ok: response.ok,
      status: response.status,
      data,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// POST endpoint for creating Jira issues
app.post('/api/jira-proxy/issue', async (req, res) => {
  try {
    const { baseUrl, auth, issueData, cfAccessClientId, cfAccessClientSecret } = req.body;
    const url = `${baseUrl}/rest/api/3/issue`;
    
    console.log('Creating Jira issue:', url);
    console.log('Auth header:', auth ? `${auth.substring(0, 20)}...` : 'Not provided');
    console.log('CF Access:', cfAccessClientId ? 'Using service token' : 'Not provided');
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (cfAccessClientId && cfAccessClientSecret) {
      headers['CF-Access-Client-Id'] = cfAccessClientId;
      headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
    } else if (auth) {
      headers['Authorization'] = auth;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(issueData),
    });

    const data = await response.json();
    console.log('Create issue response:', response.status);
    
    res.json({
      ok: response.ok,
      status: response.status,
      data,
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Update Jira issue
app.put('/api/jira-proxy/issue/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { baseUrl, auth, updateData, cfAccessClientId, cfAccessClientSecret } = req.body;
    
    console.log('Updating Jira issue:', issueKey);
    console.log('CF Access:', cfAccessClientId ? 'Using service token' : 'Not provided');

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (cfAccessClientId && cfAccessClientSecret) {
      headers['CF-Access-Client-Id'] = cfAccessClientId;
      headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
    } else if (auth) {
      headers['Authorization'] = auth;
    }

    const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });

    console.log('Update issue response:', response.status);
    
    // PUT returns 204 No Content on success
    res.json({
      ok: response.ok,
      status: response.status,
      data: response.status === 204 ? { success: true } : await response.json(),
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Delete Jira issue
app.delete('/api/jira-proxy/issue/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { baseUrl, auth, cfAccessClientId, cfAccessClientSecret } = req.body;
    
    console.log('Deleting Jira issue:', issueKey);
    console.log('CF Access:', cfAccessClientId ? 'Using service token' : 'Not provided');

    const headers = {
      'Accept': 'application/json',
    };
    
    if (cfAccessClientId && cfAccessClientSecret) {
      headers['CF-Access-Client-Id'] = cfAccessClientId;
      headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
    } else if (auth) {
      headers['Authorization'] = auth;
    }

    const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}`, {
      method: 'DELETE',
      headers
    });

    console.log('Delete issue response:', response.status);
    
    // DELETE returns 204 No Content on success
    res.json({
      ok: response.ok,
      status: response.status,
      data: response.status === 204 ? { success: true } : await response.json(),
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Jira proxy server running on http://localhost:${PORT}`);
});
