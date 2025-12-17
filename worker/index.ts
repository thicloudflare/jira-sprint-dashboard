export interface Env {
  ASSETS: Fetcher;
}

interface ProxyRequest {
  url: string;
  auth?: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  cfAccessToken?: string;
  method?: string;
  body?: unknown;
}

async function handleJiraProxy(request: Request): Promise<Response> {
  try {
    const requestBody = await request.json() as ProxyRequest;
    const { url, auth, cfAccessClientId, cfAccessClientSecret, cfAccessToken, method = 'GET', body } = requestBody;

    console.log('[Worker] Jira proxy request:', { url, method, hasCfToken: !!cfAccessToken, hasAuth: !!auth });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Always include Basic Auth for Jira authentication
    if (auth) {
      headers['Authorization'] = auth;
      console.log('[Worker] Using Basic Auth');
    }

    // CF Access authentication (for cfdata.org) - ADD to Basic Auth, don't replace
    if (cfAccessToken) {
      headers['CF-Access-Token'] = cfAccessToken;
      console.log('[Worker] Also using CF-Access-Token');
    } else if (cfAccessClientId && cfAccessClientSecret) {
      headers['CF-Access-Client-Id'] = cfAccessClientId;
      headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
      console.log('[Worker] Also using CF-Access service token');
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type');
    console.log('[Worker] Jira response:', { status: response.status, contentType });
    
    let data;
    const text = await response.text();

    if (contentType && contentType.includes('application/json')) {
      data = text ? JSON.parse(text) : {};
      // Log issue count if it's a search response
      if (data.issues) {
        console.log('[Worker] Found issues:', data.issues.length);
      }
    } else {
      console.log('[Worker] Non-JSON response, first 200 chars:', text.substring(0, 200));
      data = {
        error: 'Jira returned HTML instead of JSON. Authentication may have failed.',
        statusCode: response.status,
        preview: text.substring(0, 500)
      };
    }

    return new Response(JSON.stringify({
      ok: response.ok,
      status: response.status,
      data,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Worker] Jira proxy error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

async function handleToolkitProxy(): Promise<Response> {
  try {
    const response = await fetch('https://ai-design-workflow.thi-s-ent-account.workers.dev/api/phases');

    if (!response.ok) {
      throw new Error(`Workers API returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function handleCors(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    // API routes
    if (url.pathname === '/api/jira-proxy' && request.method === 'POST') {
      return handleJiraProxy(request);
    }

    if (url.pathname === '/api/toolkit-proxy/phases' && request.method === 'GET') {
      return handleToolkitProxy();
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  },
};
