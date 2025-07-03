# 🔗 Limitless MCP Remote Server

> A remote Model Context Protocol (MCP) server that provides AI assistants with secure, timezone-aware access to your Limitless lifelog data.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jakerains/limitless-mcp-remote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](https://github.com/jakerains/limitless-mcp-remote)

> ✅ **Status**: Fully functional timezone-aware MCP server ready for production use (Updated: July 2nd, 2025)

## ✨ Features

- 🌍 **Timezone-Aware** - Proper timezone support using IANA timezone identifiers
- 🔐 **Secure API Key Authentication** - Your data stays private with your own API key
- 🌐 **Remote MCP Protocol** - Works with Claude Desktop, Cursor, and any MCP client
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
- **SSE** (Server-Sent Events): `/sse?api_key=YOUR_API_KEY`
- **Custom Path**: `/{YOUR_API_KEY}/sse` (Firecrawl-style routing)

## 🛠️ Available Tools

| Tool | Description | Key Parameters |
|------|-------------|------------|
| `get_lifelogs` | Retrieve lifelogs from a specific date | `date` (YYYY-MM-DD), `timezone` (IANA timezone, e.g., "America/Los_Angeles") |
| `get_lifelog_by_id` | Get a specific lifelog entry | `id` (string) |
| `search_lifelogs` | Search lifelogs with text query | `query` (search terms), `limit` (max results) |
| `delete_lifelog` | Permanently delete a lifelog | `id` (string) |

### Timezone Support

The server now properly supports timezone-aware queries using the Limitless API's native timezone handling:

- **Timezone Parameter**: Use IANA timezone identifiers (e.g., "America/Los_Angeles", "Europe/London", "Asia/Tokyo")
- **Date Format**: YYYY-MM-DD format for dates
- **Default**: If no timezone specified, defaults to UTC

## 📋 Examples

### Get Today's Lifelogs (Timezone-Aware)
```json
{
  "tool": "get_lifelogs",
  "parameters": {
    "date": "2025-07-02",
    "timezone": "America/Los_Angeles"
  }
}
```

### Get Yesterday's Lifelogs
```json
{
  "tool": "get_lifelogs",
  "parameters": {
    "date": "2025-07-01",
    "timezone": "America/New_York"
  }
}
```

### Search for Specific Content
```json
{
  "tool": "search_lifelogs",
  "parameters": {
    "query": "meeting with team",
    "limit": 10
  }
}
```

### Get Specific Lifelog by ID
```json
{
  "tool": "get_lifelog_by_id",
  "parameters": {
    "id": "lifelog-entry-id-here"
  }
}
```

## 🔧 Client Configuration

### 📱 Claude Desktop (Recommended Method)

**🎉 NEW: Native Remote MCP Integration (BETA)**

Claude Desktop now supports direct remote MCP connections! No more local proxy needed.

1. Open Claude Desktop
2. Go to **Settings** → **Integrations** 
3. Click **"Add integration"**
4. Fill in:
   - **Integration name**: `Limitless Remote`
   - **Integration URL**: `https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY`
5. Click **"Add"**

That's it! Claude will connect directly to the remote server.

### 📱 Claude Desktop (Legacy Method)

**Location:** 
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "limitless-remote": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
      ]
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
    "limitless-remote": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_LIMITLESS_API_KEY"
      ]
    }
  }
}
```

## 🛠️ Usage Examples

Once configured, you can ask your AI assistant:

- *"Show me my lifelogs from yesterday in Pacific Time"* 
- *"What did I do last Tuesday in EST?"*
- *"Search my lifelogs for mentions of 'project meeting'"*
- *"Get my lifelogs from July 1st, 2025 in London time"*
- *"What conversations did I have about AI this week?"*

## ✅ Verification & Testing

### Current Status (July 2nd, 2025)
- ✅ **Server Online**: `https://limitless-mcp-remote.genaijake.workers.dev`
- ✅ **Timezone Support**: IANA timezone identifiers working properly
- ✅ **All Tools Functional**: get_lifelogs, search_lifelogs, get_lifelog_by_id, delete_lifelog
- ✅ **Claude Desktop Integration**: Both native and legacy methods working
- ✅ **API Validation**: Proper integration with Limitless API v1

### Testing Commands

**Health Check:**
```bash
curl "https://limitless-mcp-remote.genaijake.workers.dev/health"
```

**Test with API Key:**
```bash
curl "https://limitless-mcp-remote.genaijake.workers.dev/test/YOUR_API_KEY"
```

**MCP Inspector:**
```bash
npx @modelcontextprotocol/inspector@latest
```
Then connect to: `https://limitless-mcp-remote.genaijake.workers.dev/sse?api_key=YOUR_API_KEY`

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

Claude Desktop now supports OAuth authentication for remote MCP servers! You have two options:

#### Option 1: OAuth Integration (Recommended) 🎉

**New in 2025: Claude Desktop now has a simplified integration UI!**

1. Open Claude Desktop
2. Go to **Settings** → **Integrations**
3. Click **"Add integration"** (or **"Add custom integration"**)
4. Fill in:
   - **Integration name**: `Limitless` (or any name you prefer)
   - **Integration URL**: `https://limitless-mcp-remote.genaijake.workers.dev`
5. Click **"Add"**

That's it! When you first use Limitless tools, Claude will:
- Automatically discover the OAuth configuration
- Open a browser window for authentication
- Prompt you to enter your Limitless API key
- Store the OAuth token securely (your API key is never saved in files)

**Note:** This new UI is currently in BETA and available for Max, Team, and Enterprise plans, with Pro plan support coming soon.

#### Option 2: Manual Configuration (Legacy)

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
https://limitless-mcp-remote.genaijake.workers.dev/mcp
```

The web interface will handle OAuth authentication automatically!

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

## 🔐 Authentication Methods

### OAuth 2.0 (Recommended for Claude Desktop)

The server supports OAuth 2.0 authentication flow, which is more secure than embedding API keys:

1. **No API key in config files** - More secure
2. **Browser-based authentication** - Enter your API key in a secure web form
3. **Token-based access** - Uses temporary access tokens
4. **Automatic token refresh** - Seamless long-term access

**How it works:**
- Claude Desktop discovers OAuth support via `/.well-known/mcp-oauth-metadata`
- When you use a Limitless tool, Claude opens `/oauth/authorize` in your browser
- You enter your Limitless API key in the secure form
- The server exchanges your API key for an OAuth token
- Claude stores only the OAuth token, never your actual API key
- All subsequent requests use the OAuth token automatically

### API Key Authentication

For clients that don't support OAuth, you can use API keys:

1. **URL Parameter**: `?api_key=YOUR_API_KEY`
2. **Custom Header**: `X-Limitless-API-Key: YOUR_API_KEY`
3. **Authorization Header**: `Authorization: Bearer YOUR_API_KEY`

### Getting Your Limitless API Key

1. Sign up at [Limitless.ai](https://limitless.ai)
2. Go to your account settings
3. Generate an API key
4. Keep it secure!

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
- **Claude Desktop:** Try the OAuth integration method instead of manual config
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