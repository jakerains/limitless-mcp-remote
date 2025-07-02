import { LimitlessMCP } from './limitless-mcp';
import { DebugMCP } from './debug-mcp';
import { Env } from './types';
import { testLimitlessConnection } from './test-simple';

export { LimitlessMCP, DebugMCP };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Debug SSE endpoint for testing
    if (url.pathname.startsWith('/debug/') && url.pathname.endsWith('/sse')) {
      return handleDebugSSEConnection(request, env, ctx);
    }

    // SSE endpoint for MCP connections - supports both formats:
    // /sse?api_key=KEY (legacy)
    // /{API_KEY}/sse (new Firecrawl-style)
    if (url.pathname.startsWith('/sse') || url.pathname.match(/^\/[a-f0-9-]{36}\/sse$/i)) {
      return handleSSEConnection(request, env, ctx);
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        server: 'Limitless MCP Remote Server',
        version: '1.0.0',
        timestamp: new Date().toISOString() 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Test endpoint for API connection
    if (url.pathname.startsWith('/test/')) {
      const apiKey = url.pathname.split('/test/')[1];
      if (!apiKey || !apiKey.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
        return new Response(JSON.stringify({
          error: 'Invalid API key format',
          usage: 'GET /test/{API_KEY}'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await testLimitlessConnection(apiKey);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default response with usage instructions
    return new Response(JSON.stringify({
      name: 'Limitless MCP Remote Server',
      version: '1.0.0',
      description: 'Remote MCP server for Limitless lifelog API',
      endpoints: {
        'sse (recommended)': '/{YOUR_LIMITLESS_API_KEY}/sse',
        'sse (legacy)': '/sse?api_key=YOUR_LIMITLESS_API_KEY',
        health: '/health'
      },
      usage: 'Connect your MCP client to /{YOUR_API_KEY}/sse (like Firecrawl) or /sse?api_key=YOUR_API_KEY',
      example: 'https://limitless-mcp-remote.genaijake.workers.dev/53d7793f-2e9f-4db2-883c-1cd490eeba5b/sse'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  },
};

async function handleSSEConnection(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  let apiKey: string | null = null;

  // Extract API key from URL path (/{API_KEY}/sse) or query parameter (?api_key=KEY)
  const pathMatch = url.pathname.match(/^\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\/sse$/i);
  if (pathMatch) {
    apiKey = pathMatch[1];
  } else {
    apiKey = url.searchParams.get('api_key');
  }

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'Missing API key',
      message: 'Please provide your Limitless API key in the URL path: /{API_KEY}/sse or as a query parameter: /sse?api_key=YOUR_API_KEY'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  // Validate API key format (basic validation)
  if (!apiKey.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
    return new Response(JSON.stringify({
      error: 'Invalid API key format',
      message: 'API key should be in UUID format (e.g., 53d7793f-2e9f-4db2-883c-1cd490eeba5b)'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    // Create a unique session ID for this connection (hex string, 64 chars)
    const sessionId = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    
    // Get the Durable Object instance
    const durableObjectId = env.LIMITLESS_MCP_AGENT.idFromString(sessionId);
    const durableObject = env.LIMITLESS_MCP_AGENT.get(durableObjectId);
    
    // Create a new request with the API key in headers for the Durable Object
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'X-Limitless-API-Key': apiKey,
      },
      body: request.body,
    });

    // Forward the request to the Durable Object
    return await durableObject.fetch(newRequest);
    
  } catch (error) {
    console.error('Error handling SSE connection:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to establish MCP connection'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}

async function handleDebugSSEConnection(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  console.log('Main: Handling debug SSE connection');
  
  try {
    // Create a unique session ID for this connection (hex string, 64 chars)
    const sessionId = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    console.log('Main: Creating debug session', sessionId);
    
    // Get the Durable Object instance for debugging
    const durableObjectId = env.LIMITLESS_MCP_AGENT.idFromString(sessionId);
    const durableObject = env.LIMITLESS_MCP_AGENT.get(durableObjectId);
    
    // Forward the request to the debug Durable Object
    return await durableObject.fetch(request);
    
  } catch (error) {
    console.error('Main: Error in debug SSE connection:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to establish debug MCP connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}