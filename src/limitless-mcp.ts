import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LimitlessAPIClient } from './limitless-client';
import { z } from 'zod';

interface Props {
  apiKey?: string;
}

interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

export class LimitlessMCP extends McpAgent<Props, Env> {
  private limitlessClient?: LimitlessAPIClient;
  
  server = new McpServer({
    name: 'Limitless Lifelog MCP Server',
    version: '2.0.0',
  });

  // Static Router property required by Cloudflare pattern
  static Router = LimitlessMCP.mount('/sse');

  async init() {
    console.log('LimitlessMCP init called');
    
    // Get API key from props (passed through context)
    const apiKey = this.props?.apiKey;
    
    if (apiKey && typeof apiKey === 'string') {
      this.limitlessClient = new LimitlessAPIClient(apiKey);
      console.log('Limitless client initialized with API key');
      this.setupTools();
    } else {
      console.log('WARNING: No API key found in props');
    }
  }

  private setupTools() {
    this.server.tool(
      'get_lifelogs',
      'Get lifelog entries from a specific date',
      {
        date: z.string().describe('Date in YYYY-MM-DD format'),
        timezone: z.string().optional().describe('IANA timezone identifier (e.g., "America/Los_Angeles", "Europe/London"). If not provided, defaults to UTC.'),
      },
      async ({ date, timezone }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless client not initialized');
        }
        
        try {
          const lifelogs = await this.limitlessClient.getLifelogs(date, timezone);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(lifelogs, null, 2),
            }],
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'get_lifelog_by_id',
      'Get a specific lifelog entry by ID',
      {
        id: z.string().describe('The lifelog entry ID'),
      },
      async ({ id }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless client not initialized');
        }
        
        try {
          const lifelog = await this.limitlessClient.getLifelogById(id);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(lifelog, null, 2),
            }],
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'search_lifelogs',
      'Search lifelog entries by query',
      {
        query: z.string().describe('Search query'),
        limit: z.number().optional().default(10).describe('Maximum number of results'),
      },
      async ({ query, limit }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless client not initialized');
        }
        
        try {
          const searchResults = await this.limitlessClient.searchLifelogs(query, limit);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(searchResults, null, 2),
            }],
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      }
    );

    this.server.tool(
      'delete_lifelog',
      'Delete a lifelog entry by ID',
      {
        id: z.string().describe('The lifelog entry ID to delete'),
      },
      async ({ id }) => {
        if (!this.limitlessClient) {
          throw new Error('Limitless client not initialized');
        }
        
        try {
          await this.limitlessClient.deleteLifelog(id);
          return {
            content: [{
              type: 'text',
              text: `Lifelog entry ${id} deleted successfully`,
            }],
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      }
    );
  }
}