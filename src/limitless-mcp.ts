import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LimitlessAPIClient } from './limitless-client';
import { SSETransport } from './sse-transport';

export class LimitlessMCP implements DurableObject {
  private server: McpServer;
  private limitlessClient?: LimitlessAPIClient;

  constructor(private state: DurableObjectState, private env: any) {
    this.server = new McpServer({
      name: 'Limitless Lifelog MCP Server',
      version: '1.0.0',
    });

    this.setupTools();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Check if this is a debug request
    const isDebug = url.pathname.includes('/debug/');
    
    if (isDebug) {
      console.log('LimitlessMCP: Debug mode - received request to', url.pathname);
      console.log('LimitlessMCP: Request method:', request.method);
      console.log('LimitlessMCP: Request headers:', Object.fromEntries(request.headers.entries()));
      
      if (url.pathname.endsWith('/sse')) {
        return this.handleDebugSSE(request);
      }
      
      return new Response(JSON.stringify({
        debug: true,
        message: 'Debug endpoint active',
        pathname: url.pathname,
        method: request.method
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract API key from headers
    const apiKey = request.headers.get('X-Limitless-API-Key');
    
    if (apiKey && !this.limitlessClient) {
      this.setAPIKey(apiKey);
    }

    // Handle SSE connection
    if (url.pathname.startsWith('/sse')) {
      return this.handleSSE(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleSSE(request: Request): Promise<Response> {
    if (!this.limitlessClient) {
      return new Response(JSON.stringify({
        error: 'API key required',
        message: 'Limitless API key must be provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Set up SSE headers
    const response = new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    // Handle incoming messages from the request body
    if (request.body) {
      const reader = request.body.getReader();
      
      const processMessages = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            
            for (const line of lines) {
              if (line.trim() && !line.startsWith('event:') && !line.startsWith('data:')) {
                try {
                  const message = JSON.parse(line);
                  const response = await this.server.handleRequest(message);
                  
                  if (response) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
                  }
                } catch (err) {
                  console.error('Error processing message:', err);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading request stream:', error);
        } finally {
          await writer.close();
        }
      };

      // Process messages in the background
      processMessages();
    } else {
      // If no body, just keep connection alive
      setTimeout(async () => {
        await writer.close();
      }, 30000); // Close after 30 seconds of inactivity
    }

    return response;
  }

  private async handleDebugSSE(request: Request): Promise<Response> {
    console.log('LimitlessMCP: Starting debug SSE connection');
    
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

    // Send initial message
    await writer.write(encoder.encode(`data: {"type":"debug","message":"Debug SSE connection established"}\n\n`));

    // Log what we receive
    if (request.body) {
      const reader = request.body.getReader();
      
      const processMessages = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('LimitlessMCP: Debug request stream ended');
              break;
            }

            const text = new TextDecoder().decode(value);
            console.log('LimitlessMCP: Debug received data:', text);
            
            // Echo back what we received
            await writer.write(encoder.encode(`data: {"type":"echo","received":"${text.replace(/"/g, '\\"')}"}\n\n`));
          }
        } catch (error) {
          console.error('LimitlessMCP: Debug error reading stream:', error);
          await writer.write(encoder.encode(`data: {"type":"error","message":"${error}"}\n\n`));
        } finally {
          await writer.close();
        }
      };

      processMessages();
    } else {
      console.log('LimitlessMCP: Debug - No request body');
      await writer.write(encoder.encode(`data: {"type":"info","message":"No request body received"}\n\n`));
      setTimeout(async () => {
        await writer.close();
      }, 10000);
    }

    return response;
  }

  setAPIKey(apiKey: string) {
    this.limitlessClient = new LimitlessAPIClient(apiKey);
  }

  private setupTools() {
    this.server.tool(
      'limitless_get_lifelogs',
      'Retrieve lifelogs from Limitless with optional filtering',
      {
        timezone: z.string().optional().describe('IANA timezone specifier (defaults to UTC)'),
        date: z.string().optional().describe('Retrieve entries for a specific date (YYYY-MM-DD)'),
        start: z.string().optional().describe('Start datetime for entries (ISO 8601)'),
        end: z.string().optional().describe('End datetime for entries (ISO 8601)'),
        cursor: z.string().optional().describe('Pagination cursor'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction (default: desc)'),
        includeMarkdown: z.boolean().optional().describe('Include markdown content (default: true)'),
        includeHeadings: z.boolean().optional().describe('Include headings (default: true)'),
        limit: z.number().optional().describe('Maximum number of entries'),
        isStarred: z.boolean().optional().describe('Filter for starred lifelogs only'),
      },
      async (params) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless API client not initialized. API key required.');
        }

        try {
          const response = await this.limitlessClient.getLifelogs(params);
          
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  lifelogs: response.data.lifelogs,
                  cursor: response.meta.lifelogs.nextCursor,
                  hasMore: !!response.meta.lifelogs.nextCursor,
                  count: response.meta.lifelogs.count,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error retrieving lifelogs: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'limitless_get_lifelog_by_id',
      'Retrieve a specific lifelog entry by ID',
      {
        id: z.string().describe('The unique identifier of the lifelog entry'),
      },
      async ({ id }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless API client not initialized. API key required.');
        }

        try {
          const response = await this.limitlessClient.getLifelogById(id);
          
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(response.data.lifelog, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error retrieving lifelog: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'limitless_delete_lifelog',
      'Permanently delete a specific lifelog entry',
      {
        id: z.string().describe('The unique identifier of the lifelog entry to delete'),
      },
      async ({ id }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless API client not initialized. API key required.');
        }

        try {
          await this.limitlessClient.deleteLifelog(id);
          
          return {
            content: [
              {
                type: 'text' as const,
                text: `Successfully deleted lifelog with ID: ${id}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error deleting lifelog: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'limitless_search_lifelogs',
      'Search lifelogs with date/time filters and content matching',
      {
        query: z.string().optional().describe('Search query to match against lifelog content'),
        startDate: z.string().optional().describe('Start date for search range (YYYY-MM-DD)'),
        endDate: z.string().optional().describe('End date for search range (YYYY-MM-DD)'),
        isStarred: z.boolean().optional().describe('Filter for starred lifelogs only'),
        limit: z.number().optional().describe('Maximum number of results (default: 10)'),
      },
      async ({ query, startDate, endDate, isStarred, limit = 10 }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless API client not initialized. API key required.');
        }

        try {
          const params: any = {
            limit,
            includeMarkdown: true,
          };

          if (startDate) params.start = `${startDate}T00:00:00Z`;
          if (endDate) params.end = `${endDate}T23:59:59Z`;
          if (isStarred !== undefined) params.isStarred = isStarred;

          const response = await this.limitlessClient.getLifelogs(params);
          
          let filteredLogs = response.data.lifelogs;
          
          if (query) {
            filteredLogs = response.data.lifelogs.filter(log => 
              log.title.toLowerCase().includes(query.toLowerCase()) ||
              (log.markdown && log.markdown.toLowerCase().includes(query.toLowerCase()))
            );
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  results: filteredLogs,
                  totalFound: filteredLogs.length,
                  query: query || 'No text filter',
                  dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'All dates',
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error searching lifelogs: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }
}