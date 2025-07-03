import { 
  LimitlessLifelog, 
  LimitlessGetLifelogsParams, 
  LimitlessGetLifelogsResponse,
  LimitlessAPIResponse,
  LimitlessLifelogByIdResponse 
} from './types';

export class LimitlessAPIClient {
  private baseURL = 'https://api.limitless.ai/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Limitless API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async getLifelogs(params: LimitlessGetLifelogsParams | string, timezone?: string): Promise<LimitlessGetLifelogsResponse> {
    let actualParams: LimitlessGetLifelogsParams;
    
    // If params is a string, treat it as a date and use proper timezone handling
    if (typeof params === 'string') {
      actualParams = {
        date: params, // Use the date parameter instead of start/end
        timezone: timezone || 'UTC', // Default to UTC if no timezone specified
      };
    } else {
      actualParams = params;
    }
    
    const queryParams = new URLSearchParams();
    
    // Timezone-aware date parameters (preferred)
    if (actualParams.date) queryParams.append('date', actualParams.date);
    if (actualParams.timezone) queryParams.append('timezone', actualParams.timezone);
    
    // Alternative time range parameters
    if (actualParams.start) queryParams.append('start', actualParams.start);
    if (actualParams.end) queryParams.append('end', actualParams.end);
    
    // Other parameters
    if (actualParams.cursor) queryParams.append('cursor', actualParams.cursor);
    if (actualParams.limit) queryParams.append('limit', actualParams.limit.toString());
    if (actualParams.includeMarkdown !== undefined) {
      queryParams.append('includeMarkdown', actualParams.includeMarkdown.toString());
    }
    if (actualParams.includeHeadings !== undefined) {
      queryParams.append('includeHeadings', actualParams.includeHeadings.toString());
    }
    if (actualParams.isStarred !== undefined) {
      queryParams.append('isStarred', actualParams.isStarred.toString());
    }
    if (actualParams.direction) {
      queryParams.append('direction', actualParams.direction);
    }

    const url = `${this.baseURL}/lifelogs?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get lifelogs: ${response.statusText}`);
    }

    return response.json();
  }

  async searchLifelogs(query: string, limit: number = 10): Promise<LimitlessGetLifelogsResponse> {
    // Use the getLifelogs method with includeMarkdown to search through content
    const response = await this.getLifelogs({
      limit,
      includeMarkdown: true,
    });
    
    // Filter results based on query
    const filteredLogs = response.data.lifelogs.filter((log: LimitlessLifelog) =>
      log.title?.toLowerCase().includes(query.toLowerCase()) ||
      log.markdown?.toLowerCase().includes(query.toLowerCase()) ||
      log.transcriptSummary?.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      data: {
        lifelogs: filteredLogs.slice(0, limit)
      },
      meta: response.meta
    };
  }

  async getLifelogById(id: string): Promise<LimitlessLifelogByIdResponse> {
    return this.makeRequest(`/lifelogs/${id}`);
  }

  async deleteLifelog(id: string): Promise<void> {
    const url = `${this.baseURL}/lifelogs/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete lifelog (${response.status}): ${errorText}`);
    }
  }
}