// Simple test to verify API key and Limitless connection works
import { LimitlessAPIClient } from './limitless-client';

export async function testLimitlessConnection(apiKey: string) {
  try {
    const client = new LimitlessAPIClient(apiKey);
    const response = await client.getLifelogs({ limit: 1 });
    
    return {
      success: true,
      data: {
        count: response.meta.lifelogs.count,
        hasLifelogs: response.data.lifelogs.length > 0,
        firstLifelog: response.data.lifelogs[0]?.title || 'No lifelogs'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}