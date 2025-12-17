interface Env {}

interface ProxyRequest {
  url: string;
  auth?: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  cfAccessToken?: string;
  method?: string;
  body?: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const requestBody = await context.request.json() as ProxyRequest;
    const { url, auth, cfAccessClientId, cfAccessClientSecret, cfAccessToken, method = 'GET', body } = requestBody;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // CF Access authentication (for cfdata.org)
    if (cfAccessToken) {
      headers['CF-Access-Token'] = cfAccessToken;
    } else if (cfAccessClientId && cfAccessClientSecret) {
      headers['CF-Access-Client-Id'] = cfAccessClientId;
      headers['CF-Access-Client-Secret'] = cfAccessClientSecret;
    } else if (auth) {
      // Only use Basic Auth for standard Atlassian Cloud (no CF Access)
      headers['Authorization'] = auth;
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
    let data;
    const text = await response.text();

    if (contentType && contentType.includes('application/json')) {
      data = text ? JSON.parse(text) : {};
    } else {
      data = {
        error: 'Jira returned HTML instead of JSON. This usually means authentication failed or the endpoint is incorrect.',
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
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
