import { LimitlessMCP } from './limitless-mcp';
import { Env } from './types';

export { LimitlessMCP };

// Main handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'limitless-mcp-remote',
        timestamp: new Date().toISOString(),
        auth_methods: ['api_key']
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract API key from various sources
    const apiKey = extractApiKey(request);
    
    if (!apiKey) {
      return new Response('Unauthorized: API key required', { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="Limitless MCP"'
        }
      });
    }
    
    // Store API key in context props
    ctx.props = { apiKey };
    
    // Delegate all other requests to the MCP Router
    return LimitlessMCP.Router.fetch(request, env, ctx);
  }
};

// Extract API key from various sources
function extractApiKey(request: Request): string | null {
  const url = new URL(request.url);
  
  // 1. Check URL query parameter
  let apiKey = url.searchParams.get('api_key');
  if (apiKey) return apiKey;
  
  // 2. Check custom header
  apiKey = request.headers.get('X-Limitless-API-Key');
  if (apiKey) return apiKey;
  
  // 3. Check Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

