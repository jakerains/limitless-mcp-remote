import { LimitlessLifelog, LimitlessGetLifelogsParams, LimitlessAPIResponse, LimitlessLifelogByIdResponse } from './types';

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

  async getLifelogs(params: LimitlessGetLifelogsParams = {}): Promise<LimitlessAPIResponse> {
    return this.makeRequest('/lifelogs', params);
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