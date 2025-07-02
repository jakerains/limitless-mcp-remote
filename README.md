# 🔗 Limitless MCP Remote Server

> A remote Model Context Protocol (MCP) server that provides AI assistants with secure access to your Limitless lifelog data.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/genaijake/limitless-mcp-remote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange.svg)](https://github.com/genaijake/limitless-mcp-remote)

> ⚠️ **Status**: Core infrastructure is complete, but MCP protocol implementation needs refinement. See [Known Issues](#-known-issues) below.

## ✨ Features

- 🔐 **Secure API Key Authentication** - Your data stays private with your own API key
- 🌐 **Remote MCP Protocol** - Works with Claude, AI assistants, and any MCP client
- ⚡ **Cloudflare Workers** - Global edge deployment for low latency
- 🔍 **Rich Search & Filtering** - Find lifelogs by date, content, starred status
- 📊 **Complete CRUD Operations** - Read, search, and delete lifelog entries
- 🎯 **Multi-user Support** - Each user connects with their own API key

## 🚀 Quick Start

### Connect to the Live Server

Use this URL format with your Limitless API key:

```
https://limitless-mcp-remote.genaijake.workers.dev/{YOUR_LIMITLESS_API_KEY}/sse
```

**Example**:
```
https://limitless-mcp-remote.genaijake.workers.dev/12345678-1234-5678-9abc-123456789012/sse
```

### Supported Clients

- **Claude Desktop** - Add to your MCP configuration
- **AI Playground** - Connect directly via URL
- **MCP Inspector** - For testing and development
- **Any MCP Client** - Following the standard protocol

## 🛠️ Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `limitless_get_lifelogs` | Retrieve lifelogs with filtering | `timezone`, `date`, `start`, `end`, `cursor`, `direction`, `includeMarkdown`, `limit`, `isStarred` |
| `limitless_get_lifelog_by_id` | Get a specific lifelog entry | `id` |
| `limitless_delete_lifelog` | Permanently delete a lifelog | `id` |
| `limitless_search_lifelogs` | Search with text and date filters | `query`, `startDate`, `endDate`, `isStarred`, `limit` |

## 📋 Examples

### Get Recent Lifelogs
```json
{
  "tool": "limitless_get_lifelogs",
  "parameters": {
    "limit": 5,
    "direction": "desc",
    "includeMarkdown": true
  }
}
```

### Search for Specific Content
```json
{
  "tool": "limitless_search_lifelogs",
  "parameters": {
    "query": "meeting",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "limit": 10
  }
}
```

### Get Starred Lifelogs
```json
{
  "tool": "limitless_get_lifelogs",
  "parameters": {
    "isStarred": true,
    "includeMarkdown": true
  }
}
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Local Development

```bash
# Clone the repository
git clone https://github.com/genaijake/limitless-mcp-remote.git
cd limitless-mcp-remote

# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### Testing

Test the health endpoint:
```bash
curl https://limitless-mcp-remote.genaijake.workers.dev/health
```

Test with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector@latest
```

Then connect to:
```
http://localhost:8787/{YOUR_API_KEY}/sse
```

## 🏗️ Architecture

### Components

- **Entry Point** (`src/index.ts`) - Cloudflare Worker handler with routing and CORS
- **MCP Server** (`src/limitless-mcp.ts`) - Durable Object implementing MCP protocol
- **API Client** (`src/limitless-client.ts`) - HTTP client for Limitless API v1
- **Types** (`src/types.ts`) - TypeScript interfaces for API data

### Key Features

- **Stateful Sessions** - Each MCP connection gets its own Durable Object
- **API Key Security** - Keys passed via URL path, never stored server-side
- **Error Handling** - Comprehensive error responses with helpful messages
- **CORS Support** - Works with web-based MCP clients

## 🔐 Security

- ✅ API keys are validated but never stored
- ✅ Each user session is isolated via Durable Objects
- ✅ HTTPS enforcement for all connections
- ✅ Input validation on all parameters
- ✅ Rate limiting via Cloudflare's infrastructure

## 📖 API Reference

### URL Formats

**Recommended (Firecrawl-style)**:
```
/{YOUR_API_KEY}/sse
```

**Legacy (Query parameter)**:
```
/sse?api_key={YOUR_API_KEY}
```

### Endpoints

- `GET /` - Server information and usage
- `GET /health` - Health check
- `GET /{api_key}/sse` - MCP connection endpoint
- `GET /sse?api_key={key}` - Legacy MCP connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚨 Known Issues

### MCP Protocol Implementation
The server currently has a complete infrastructure but needs proper MCP protocol handshake implementation:

**What Works ✅**
- Firecrawl-style URL routing (`/{API_KEY}/sse`)
- Limitless API integration (test with `/test/{API_KEY}`)
- Cloudflare Workers deployment
- API key validation and security
- All MCP tools are defined and functional

**What Needs Fixing ❌**
- MCP protocol handshake (currently returns permission errors)
- Proper SSE transport implementation following MCP specification

**Debugging Tools**
- Test API connection: `GET /test/{YOUR_API_KEY}`
- Debug SSE endpoint: `GET /debug/test/sse`
- Health check: `GET /health`

### Contributing to Fix
The main issue is in `src/limitless-mcp.ts` - the MCP server needs to properly implement the MCP transport protocol handshake. Contributions welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Limitless API Documentation](https://www.limitless.ai/developers)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 💬 Support

- Open an [issue](https://github.com/genaijake/limitless-mcp-remote/issues) for bug reports
- Join discussions in the [Limitless Slack community](https://www.limitless.ai/developers)
- Check the [MCP documentation](https://modelcontextprotocol.io/docs) for protocol details

---

<p align="center">
  <strong>Built with ❤️ for the Limitless and MCP communities</strong>
</p>