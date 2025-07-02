export class DebugMCP implements DurableObject {
  constructor(private state: DurableObjectState, private env: any) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    console.log('DebugMCP: Received request to', url.pathname);
    
    // Extract API key from headers
    const apiKey = request.headers.get('X-Limitless-API-Key');
    console.log('DebugMCP: API key present:', !!apiKey);
    
    if (url.pathname.startsWith('/sse')) {
      return this.handleSSE(request);
    }

    return new Response('Debug MCP - not SSE path', { status: 404 });
  }

  private async handleSSE(request: Request): Promise<Response> {
    console.log('DebugMCP: Starting SSE connection');
    
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Send initial SSE headers
    const response = new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    // Log what we receive
    if (request.body) {
      const reader = request.body.getReader();
      
      const processMessages = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('DebugMCP: Request stream ended');
              break;
            }

            const text = new TextDecoder().decode(value);
            console.log('DebugMCP: Received data:', text);
            
            // Echo back what we received
            await writer.write(encoder.encode(`data: Received: ${text}\n\n`));
          }
        } catch (error) {
          console.error('DebugMCP: Error reading stream:', error);
        } finally {
          await writer.close();
        }
      };

      processMessages();
    } else {
      console.log('DebugMCP: No request body');
      // Send a test message and close
      await writer.write(encoder.encode(`data: {"test": "No request body received"}\n\n`));
      setTimeout(async () => {
        await writer.close();
      }, 5000);
    }

    return response;
  }
}