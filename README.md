# 🔗 Limitless MCP Remote Server

> A remote Model Context Protocol (MCP) server that provides AI assistants with secure access to your Limitless lifelog data.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/genaijake/limitless-mcp-remote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](https://github.com/genaijake/limitless-mcp-remote)

> ✅ **Status**: Fully functional MCP server ready for production use with your Limitless API key.

## ✨ Features

- 🔐 **Secure API Key Authentication** - Your data stays private with your own API key
- 🌐 **Remote MCP Protocol** - Works with Claude, AI assistants, and any MCP client
- ⚡ **Cloudflare Workers** - Global edge deployment for low latency
- 🔍 **Rich Search & Filtering** - Find lifelogs by date, content, starred status
- 📊 **Complete CRUD Operations** - Read, search, and delete lifelog entries
- 🎯 **Multi-user Support** - Each user connects with their own API key

## 🚀 Quick Start

**Production Server URL:**
```
https://limitless-mcp-remote.genaijake.workers.dev
```

**Supported Transports:**
- **StreamableHttp** (recommended): `/mcp?api_key=YOUR_API_KEY`
- **SSE** (legacy): `/sse?api_key=YOUR_API_KEY`

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

## ✅ Verification

### What Works 
- ✅ Firecrawl-style URL routing (`/{API_KEY}/sse`)
- ✅ Limitless API integration (test with `/test/{API_KEY}`)
- ✅ Cloudflare Workers deployment with Durable Objects
- ✅ API key validation and security
- ✅ Proper MCP protocol implementation with JSON-RPC
- ✅ All four MCP tools fully functional
- ✅ SSE transport with proper handshake

### Testing Tools
- **Health check**: `GET /health`
- **API connection test**: `GET /test/{YOUR_API_KEY}`
- **MCP Inspector**: Connect via `/{YOUR_API_KEY}/sse`

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

## 🔧 Client Configuration

### 📱 Claude Desktop

**Location:** 
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "limitless-lifelog": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
      ]
    }
  }
}
```

**Alternative (using environment variables):**
```json
{
  "mcpServers": {
    "limitless-lifelog": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=${LIMITLESS_API_KEY}"
      ],
      "env": {
        "LIMITLESS_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

### 🖱️ Cursor

**Location:** `~/.cursor/mcp.json` (create if it doesn't exist)

**Configuration:**
```json
{
  "mcpServers": {
    "limitless-lifelog": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/mcp?api_key=YOUR_LIMITLESS_API_KEY"
      ]
    }
  }
}
```

**One-line setup:** Paste this into Cursor when prompted:
```bash
npx mcp-remote https://limitless-mcp-remote.genaijake.workers.dev/mcp?api_key=YOUR_LIMITLESS_API_KEY
```

### 🌊 Windsurf (Codeium)

**Location:** `~/.codeium/windsurf/mcp_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "limitless-lifelog": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
      ]
    }
  }
}
```

### 💻 VS Code (with GitHub Copilot)

**Location:** User Settings JSON (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)")

**Configuration:**
```json
{
  "mcp": {
    "servers": {
      "limitless-lifelog": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
        ]
      }
    }
  }
}
```

### 🔗 Cline (VS Code Extension)

**Setup:** Cline → MCP Servers → Configure MCP Servers

**Configuration:**
```json
{
  "mcpServers": {
    "limitless-lifelog": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
      ]
    }
  }
}
```

### ⚡ Zed (Preview)

**Setup:** Assistant → Settings → Context Servers → Add Context Server

**Configuration:**
- **Name:** Limitless Lifelog
- **Command:** 
```bash
npx mcp-remote https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY
```

### 🌐 Claude.ai (Web)

**Setup:** Settings → Integrations → Add Integration

**Server URL:**
```
https://limitless-mcp-remote.genaijake.workers.dev/mcp?api_key=YOUR_LIMITLESS_API_KEY
```

### 📱 Other Clients

For clients not listed above, use this general pattern:

**For JSON-based configuration:**
```json
{
  "limitless-lifelog": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
    ]
  }
}
```

**For one-line configuration:**
```bash
npx mcp-remote https://limitless-mcp-remote.genaijake.workers.dev/mcp?api_key=YOUR_LIMITLESS_API_KEY
```

## 🔐 API Key Setup

1. **Get your Limitless API key:**
   - Sign up at [Limitless.ai](https://limitless.ai)
   - Go to your account settings
   - Generate an API key

2. **Replace `YOUR_LIMITLESS_API_KEY`** in the configurations above with your actual API key

3. **Restart your MCP client** after configuration

## 🛠️ Usage Examples

Once configured, you can ask your AI assistant:

- *"Show me my lifelogs from yesterday"*
- *"What did I do last Tuesday?"*
- *"Search my lifelogs for mentions of 'project meeting'"*
- *"Delete the lifelog entry from this morning about coffee"*
- *"What conversations did I have about AI this week?"*

## 🔍 Transport Options

### StreamableHttp (Recommended)
- **URL:** `/mcp?api_key=YOUR_API_KEY`
- **Best for:** Modern clients, better performance
- **Supported by:** Cursor, Claude.ai, VS Code, newer MCP clients

### SSE (Server-Sent Events)
- **URL:** `/sse?api_key=YOUR_API_KEY`
- **Best for:** Legacy compatibility
- **Supported by:** Claude Desktop, Windsurf, older MCP clients

## 🚨 Troubleshooting

### Common Issues

**1. "No tools available" or "Server not connecting"**
- Verify your API key is correct
- Check that you're using the right transport (SSE vs StreamableHttp)
- Restart your MCP client completely

**2. "Authentication failed"**
- Ensure your Limitless API key is valid
- Check for typos in the API key
- Verify the API key has the necessary permissions

**3. "Command not found: npx"**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org)
- Verify `npx` is available in your terminal

**4. Client-specific issues:**
- **Claude Desktop:** Restart the app after config changes
- **Cursor:** Check `~/.cursor/mcp.json` exists and is valid JSON
- **VS Code:** Ensure GitHub Copilot extension is installed

### Debug Steps

1. **Test the server directly:**
```bash
curl "https://limitless-mcp-remote.genaijake.workers.dev/health"
```

2. **Test with your API key:**
```bash
curl "https://limitless-mcp-remote.genaijake.workers.dev/test/YOUR_API_KEY"
```

3. **Check MCP connection:**
```bash
npx mcp-remote https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_API_KEY
```

## 🏗️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/jakerains/limitless-mcp-remote.git
cd limitless-mcp-remote

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deploy to Cloudflare Workers

```bash
# Deploy to production
npm run deploy
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

## 🔗 Links

- **Limitless.ai:** [https://limitless.ai](https://limitless.ai)
- **MCP Protocol:** [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Cloudflare Workers:** [https://workers.cloudflare.com](https://workers.cloudflare.com)

---

**Need help?** Open an issue on GitHub or contact the maintainers.