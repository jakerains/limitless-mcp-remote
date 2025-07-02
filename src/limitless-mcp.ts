import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LimitlessAPIClient } from './limitless-client';

export class LimitlessMCP extends McpAgent {
  private limitlessClient?: LimitlessAPIClient;
  private apiKey?: string;
  
  server = new McpServer({
    name: 'Limitless Lifelog MCP Server',
    version: '1.0.0',
  });

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Extract API key before calling parent fetch
    let apiKey: string | undefined;
    
    // 1. Check URL path pattern /{API_KEY}/sse or /{API_KEY}/mcp
    const pathMatch = url.pathname.match(/^\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\/(sse|mcp)$/i);
    if (pathMatch) {
      apiKey = pathMatch[1];
      console.log('API key found in URL path:', apiKey);
    }
    
    // 2. Check query parameter ?api_key=
    if (!apiKey) {
      apiKey = url.searchParams.get('api_key') || undefined;
      if (apiKey) {
        console.log('API key found in query params:', apiKey);
      }
    }
    
    // 3. Check request headers
    if (!apiKey) {
      apiKey = request.headers.get('X-Limitless-API-Key') || undefined;
      if (apiKey) {
        console.log('API key found in headers');
      }
    }
    
    // Store the API key for use in init
    if (apiKey) {
      this.apiKey = apiKey;
    }
    
    // Call parent fetch
    return super.fetch(request);
  }

  async init(props?: { 
    user?: { apiKey?: string }; 
    url?: URL;
    request?: Request;
  }) {
    console.log('LimitlessMCP init called with props:', {
      hasProps: !!props,
      hasUser: !!props?.user,
      hasUrl: !!props?.url,
      hasRequest: !!props?.request,
      urlPathname: props?.url?.pathname,
      urlSearch: props?.url?.search,
      storedApiKey: !!this.apiKey
    });
    
    // Use the stored API key from fetch
    let apiKey = this.apiKey;
    
    // Also check props for completeness
    if (!apiKey && props?.user?.apiKey) {
      apiKey = props.user.apiKey;
      console.log('API key found in props.user');
    }
    
    if (apiKey) {
      this.limitlessClient = new LimitlessAPIClient(apiKey);
      console.log('Limitless client initialized with API key');
    } else {
      console.log('WARNING: No API key found, client not initialized');
    }

    // Register all the tools
    this.setupTools();
  }

  private setupTools() {
    this.server.tool(
      'limitless_get_lifelogs',
      'Retrieve lifelogs from Limitless with optional filtering',
      async (params: any) => {
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
      async (params: any) => {
        const { id } = params;
        if (!id) {
          throw new Error('ID parameter is required');
        }
        
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
      async (params: any) => {
        const { id } = params;
        if (!id) {
          throw new Error('ID parameter is required');
        }
        
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
      async (params: any) => {
        const { query, startDate, endDate, isStarred, limit = 10 } = params;
        
        if (!this.limitlessClient) {
          throw new Error('Limitless API client not initialized. API key required.');
        }

        try {
          const apiParams: any = {
            limit,
            includeMarkdown: true,
          };

          if (startDate) apiParams.start = `${startDate}T00:00:00Z`;
          if (endDate) apiParams.end = `${endDate}T23:59:59Z`;
          if (isStarred !== undefined) apiParams.isStarred = isStarred;

          const response = await this.limitlessClient.getLifelogs(apiParams);
          
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