import { LimitlessMCP } from './limitless-mcp';
import { Env } from './types';
import { testLimitlessConnection } from './test-simple';

export { LimitlessMCP };

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

    // Handle both SSE and StreamableHttp endpoints
    // SSE: /{API_KEY}/sse or /sse?api_key=KEY
    // StreamableHttp: /{API_KEY}/mcp or /mcp?api_key=KEY
    if (url.pathname.match(/^\/[a-f0-9-]{36}\/(sse|mcp)$/i) || 
        url.pathname === '/sse' || 
        url.pathname === '/mcp') {
      
      // Use the appropriate transport based on the endpoint
      if (url.pathname.includes('/sse')) {
        // SSE transport (for backward compatibility)
        return LimitlessMCP.serveSSE('/sse', { binding: 'LIMITLESS_MCP_AGENT' }).fetch(request, env, ctx);
      } else if (url.pathname.includes('/mcp')) {
        // StreamableHttp transport (new standard)
        return LimitlessMCP.serve('/mcp', { binding: 'LIMITLESS_MCP_AGENT' }).fetch(request, env, ctx);
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        server: 'Limitless MCP Remote Server',
        version: '2.0.0',
        transports: ['SSE (deprecated)', 'StreamableHttp'],
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
      version: '2.0.0',
      description: 'Remote MCP server for Limitless lifelog API',
      transports: {
        sse: {
          status: 'supported (deprecated)',
          endpoints: {
            'firecrawl-style': '/{YOUR_LIMITLESS_API_KEY}/sse',
            'legacy': '/sse?api_key=YOUR_LIMITLESS_API_KEY'
          }
        },
        streamableHttp: {
          status: 'supported (recommended)',
          endpoints: {
            'firecrawl-style': '/{YOUR_LIMITLESS_API_KEY}/mcp',
            'legacy': '/mcp?api_key=YOUR_LIMITLESS_API_KEY'
          }
        }
      },
      endpoints: {
        health: '/health',
        test: '/test/{API_KEY}'
      },
      example: {
        sse: 'https://limitless-mcp-remote.genaijake.workers.dev/53d7793f-2e9f-4db2-883c-1cd490eeba5b/sse',
        streamableHttp: 'https://limitless-mcp-remote.genaijake.workers.dev/53d7793f-2e9f-4db2-883c-1cd490eeba5b/mcp'
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  },
};

