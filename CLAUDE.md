# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Remote MCP (Model Context Protocol) Server** that provides access to the Limitless lifelog API through the standardized MCP protocol. It's deployed as a Cloudflare Worker and allows MCP clients (like Claude, AI assistants, etc.) to interact with a user's Limitless lifelog data.

## Architecture

### Core Components

**Entry Point (`src/index.ts`)**
- Main Cloudflare Worker handler that routes requests
- Handles CORS, API key extraction from URL parameters, and request forwarding
- Routes SSE connections to Durable Objects for stateful MCP sessions
- Provides health check and usage information endpoints

**MCP Server (`src/limitless-mcp.ts`)**
- Implements the actual MCP server using `@modelcontextprotocol/sdk`
- Defines 4 core tools for interacting with Limitless API
- Manages Limitless API client instances per session

**API Client (`src/limitless-client.ts`)**
- HTTP client for Limitless API v1
- Handles authentication via X-API-Key header
- Supports all available Limitless endpoints (get, delete lifelogs)

**Types (`src/types.ts`)**
- TypeScript interfaces for Limitless API data structures
- Environment bindings for Cloudflare Workers

### Key Architecture Decisions

**API Key Security**: API keys are passed via URL query parameters (`?api_key=`) rather than stored server-side, allowing multiple users to use the same deployed server with their own credentials.

**Durable Objects**: Each MCP client session gets its own Durable Object instance, enabling stateful connections while the Worker handles routing and API key validation.

**Transport Protocol**: Uses Server-Sent Events (SSE) for MCP communication, following the MCP specification for remote servers.

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

**Local Development**: Server runs on `http://localhost:8787/{API_KEY}/sse`

**MCP Inspector**: Use `npx @modelcontextprotocol/inspector@latest` to connect and test tools

**Health Check**: GET `/health` returns server status

## API Key Requirements

- Must be a valid UUID format (e.g., `53d7793f-2e9f-4db2-883c-1cd490eeba5b`)
- Can be provided in two ways:
  - **Recommended (Firecrawl-style)**: `/{API_KEY}/sse` 
  - **Legacy**: `/sse?api_key={API_KEY}`
- Each user provides their own Limitless API key when connecting

## Connection URLs

**Production**: `https://limitless-mcp-remote.genaijake.workers.dev/{YOUR_API_KEY}/sse`

**Example**: `https://limitless-mcp-remote.genaijake.workers.dev/53d7793f-2e9f-4db2-883c-1cd490eeba5b/sse`

## Configuration Notes

- `wrangler.toml` configures the Durable Object binding as `LIMITLESS_MCP_AGENT`
- Server requires `nodejs_compat` flag for MCP SDK compatibility
- No environment variables needed - API keys are provided by clients at connection time