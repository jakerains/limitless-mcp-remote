// Simple test to verify API key and Limitless connection works
import { LimitlessAPIClient } from './limitless-client';
export async function testLimitlessConnection(apiKey) {
    try {
        const client = new LimitlessAPIClient(apiKey);
        const response = await client.getLifelogs({ limit: 1 });
        console.log('\n✅ Test passed! Retrieved lifelogs:', {
            count: response.meta?.lifelogs?.count || 0,
            hasLogs: response.data.lifelogs.length > 0,
            firstLogTitle: response.data.lifelogs[0]?.title,
        });
        return {
            success: true,
            data: {
                count: response.meta?.lifelogs?.count || 0,
                hasLifelogs: response.data.lifelogs.length > 0,
                firstLifelog: response.data.lifelogs[0]?.title || 'No lifelogs'
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
