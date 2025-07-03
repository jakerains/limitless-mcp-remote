export interface Env {
  MCP_OBJECT: DurableObjectNamespace;
  OAUTH_STORAGE: KVNamespace;
  OAUTH_PROVIDER: any;
}

export interface LimitlessLifelog {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  startedAt: string;
  endedAt: string;
  title: string;
  markdown?: string;
  isStarred: boolean;
  transcriptSummary?: string;
  transcriptContent?: string;
}

export interface LimitlessGetLifelogsParams {
  // Timezone-aware date parameters (preferred method)
  date?: string; // YYYY-MM-DD format
  timezone?: string; // IANA timezone specifier (e.g., "America/Los_Angeles")
  
  // Alternative time range parameters
  start?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm:SS format
  end?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm:SS format
  
  // Other parameters
  cursor?: string;
  limit?: number;
  includeMarkdown?: boolean;
  includeHeadings?: boolean;
  isStarred?: boolean;
  direction?: 'asc' | 'desc';
}

export interface LimitlessGetLifelogsResponse {
  data: {
    lifelogs: LimitlessLifelog[];
  };
  meta?: {
    lifelogs: {
      nextCursor?: string;
      count: number;
    };
  };
}

export interface LimitlessAPIResponse {
  data: any;
  meta?: any;
  error?: string;
}

export interface LimitlessLifelogByIdResponse {
  data: {
    lifelog: LimitlessLifelog;
  };
}