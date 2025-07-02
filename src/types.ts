export interface Env {
  LIMITLESS_MCP_AGENT: DurableObjectNamespace;
}

export interface LimitlessLifelog {
  id: string;
  title: string;
  markdown?: string;
  contentNodes: Array<{
    type: string;
    content: any;
  }>;
  startTime: string;
  endTime: string;
  isStarred: boolean;
  lastUpdated: string;
}

export interface LimitlessGetLifelogsParams {
  timezone?: string;
  date?: string;
  start?: string;
  end?: string;
  cursor?: string;
  direction?: 'asc' | 'desc';
  includeMarkdown?: boolean;
  includeHeadings?: boolean;
  limit?: number;
  isStarred?: boolean;
}

export interface LimitlessAPIResponse {
  data: {
    lifelogs: LimitlessLifelog[];
  };
  meta: {
    lifelogs: {
      count: number;
      nextCursor?: string;
    };
  };
}

export interface LimitlessLifelogByIdResponse {
  data: {
    lifelog: LimitlessLifelog;
  };
}