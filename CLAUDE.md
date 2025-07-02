# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Remote MCP (Model Context Protocol) Server** that provides access to the Limitless lifelog API through the standardized MCP protocol. It's deployed as a Cloudflare Worker and allows MCP clients (like Claude, AI assistants, etc.) to interact with a user's Limitless lifelog data.

## Current Status (July 2025)

### ✅ Completed Migration (July 2, 2025)
- **Migrated to McpAgent**: Refactored from manual DurableObject to use Cloudflare's `McpAgent` class
- **Dual Transport Support**: Now supports both SSE (deprecated) and StreamableHttp transports
- **API Integration**: Limitless API client working correctly (verified with test endpoint)
- **URL Routing**: Firecrawl-style `/{API_KEY}/sse` and `/{API_KEY}/mcp` patterns implemented
- **Health Check**: Working at `/health` endpoint
- **Test Endpoint**: Working at `/test/{API_KEY}`

### ⚠️ Current Issues

**Transport Connection Issues**
- Both SSE and StreamableHttp endpoints return errors when trying to establish MCP connections
- SSE endpoint returns 404 (routing issue)
- StreamableHttp endpoint returns 405 Method Not Allowed
- The McpAgent class methods (`serveSSE` and `serve`) might not be properly handling the URL pattern with API keys

**Potential Root Causes**
1. The McpAgent expects a different URL pattern than what we're using
2. The API key extraction logic in the `init` method might not be working correctly
3. The route handling in index.ts might need adjustment for McpAgent's expectations

### 🔧 Technical Details

**Dependencies Updated**
- Added `agents` package (v0.0.101) for McpAgent support
- Kept `@modelcontextprotocol/sdk` for McpServer functionality

**Architecture Changes**
- `LimitlessMCP` now extends `McpAgent` instead of implementing DurableObject
- Removed manual SSE transport implementation
- Tool registration moved to use new `server.tool()` API format
- API key extraction handled in `init()` method with multiple fallback options

## Architecture

### Core Components

**Entry Point (`src/index.ts`)**
- Main Cloudflare Worker handler that routes requests
- Handles CORS and routes to appropriate transport endpoints
- Uses `LimitlessMCP.serveSSE()` and `LimitlessMCP.serve()` static methods
- Provides health check and usage information endpoints

**MCP Server (`src/limitless-mcp.ts`)**
- Now extends `McpAgent` from the `agents` package
- Implements the `init()` method for API key extraction and tool registration
- Defines 4 core tools for interacting with Limitless API
- Uses `McpServer` from `@modelcontextprotocol/sdk/server/mcp.js`

**API Client (`src/limitless-client.ts`)**
- HTTP client for Limitless API v1
- Handles authentication via X-API-Key header
- Supports all available Limitless endpoints (get, delete lifelogs)

**Types (`src/types.ts`)**
- TypeScript interfaces for Limitless API data structures
- Environment bindings for Cloudflare Workers

### Key Architecture Decisions

**API Key Security**: API keys are passed via URL parameters (/{API_KEY}/endpoint) for easy client configuration, with fallback support for query parameters and headers.

**McpAgent Base Class**: Leverages Cloudflare's McpAgent for automatic transport handling, state management, and Durable Object integration.

**Dual Transport Support**: Maintains backward compatibility with SSE while supporting the new StreamableHttp standard.

## Available Tools

The MCP server exposes these tools to clients:

1. `limitless_get_lifelogs` - Retrieve lifelogs with filtering (date, starred, pagination)
2. `limitless_get_lifelog_by_id` - Get specific lifelog by ID
3. `limitless_delete_lifelog` - Delete a lifelog entry
4. `limitless_search_lifelogs` - Search lifelogs with text and date filtering

## Development Commands

```bash
# Start local development server
npm run dev
# or
npm start

# Deploy to Cloudflare
npm run deploy
```

## Testing the Server

### Working Endpoints
- **Health Check**: `GET /health` ✅ Working
- **API Test**: `GET /test/53d7793f-2e9f-4db2-883c-1cd490eeba5b` ✅ Working
- **Limitless API Connection**: Verified working with test API key

### Problematic Endpoints
- **SSE Connection**: `GET /{API_KEY}/sse` ❌ Returns 404
- **StreamableHttp Connection**: `POST /{API_KEY}/mcp` ❌ Returns 405 Method Not Allowed
- **MCP Inspector**: Cannot connect to either endpoint

### Local Development
Server runs on `http://localhost:8787` with both transport endpoints available

### Current Test Results
```bash
# Health check - WORKING
curl http://localhost:8787/health
# Returns: {"status":"healthy","server":"Limitless MCP Remote Server","version":"2.0.0"...}

# API test - WORKING
curl http://localhost:8787/test/53d7793f-2e9f-4db2-883c-1cd490eeba5b
# Returns: {"success":true,"data":{"count":1,"hasLifelogs":true...}}

# SSE connection - FAILING
curl http://localhost:8787/53d7793f-2e9f-4db2-883c-1cd490eeba5b/sse
# Returns: 404 Not Found

# StreamableHttp connection - FAILING  
curl -X POST http://localhost:8787/53d7793f-2e9f-4db2-883c-1cd490eeba5b/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
# Returns: 405 Method Not Allowed
```

## API Key Requirements

- Must be a valid UUID format (e.g., `53d7793f-2e9f-4db2-883c-1cd490eeba5b`)
- Can be provided in multiple ways:
  - **URL Path (Recommended)**: `/{API_KEY}/sse` or `/{API_KEY}/mcp`
  - **Query Parameter**: `/sse?api_key={API_KEY}` or `/mcp?api_key={API_KEY}`
  - **Header**: `X-Limitless-API-Key: {API_KEY}`
- Each user provides their own Limitless API key when connecting

## Connection URLs

**Production**: 
- SSE: `https://limitless-mcp-remote.genaijake.workers.dev/{YOUR_API_KEY}/sse`
- StreamableHttp: `https://limitless-mcp-remote.genaijake.workers.dev/{YOUR_API_KEY}/mcp`

**Local Development**:
- SSE: `http://localhost:8787/{YOUR_API_KEY}/sse`
- StreamableHttp: `http://localhost:8787/{YOUR_API_KEY}/mcp`

## Configuration Notes

- `wrangler.toml` configures the Durable Object binding as `LIMITLESS_MCP_AGENT`
- Server requires `nodejs_compat` flag for MCP SDK compatibility
- No environment variables needed - API keys are provided by clients at connection time

## Next Steps for Debugging

1. **Check McpAgent Route Expectations**: The McpAgent class might expect different URL patterns
2. **Debug Transport Initialization**: Add logging to see if the transport is properly initialized
3. **Test with Simple Routes**: Try `/sse` and `/mcp` without API key in path
4. **Review Cloudflare Examples**: Compare with working examples from Cloudflare's MCP server implementations
5. **Check Durable Object Binding**: Ensure the binding is properly passed through the transport layers

### Files Requiring Investigation
- `src/index.ts` - Route handling might need adjustment
- `src/limitless-mcp.ts` - API key extraction in init() might not be working
- The McpAgent's internal routing expectations need to be understood

### Reference Documentation
- MCP 2025 Specification: https://modelcontextprotocol.io/specification/2025-03-26
- Cloudflare MCP Transport docs: https://developers.cloudflare.com/agents/model-context-protocol/transport
- McpAgent API: https://developers.cloudflare.com/agents/model-context-protocol/mcp-agent-api