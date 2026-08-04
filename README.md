# mcp-leadconnector

LeadConnector / GoHighLevel MCP Pack — wraps the GoHighLevel CRM for AI agents.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `leadconnector_list_contacts` | Search or list CRM contacts in a GoHighLevel/LeadConnector account. Free-text query matches name, email, or phone. Returns a {contacts:[...], meta} envelope with contact IDs, names, emails, phones, tags, and custom fields. |
| `leadconnector_get_contact` | Fetch a single CRM contact by its contact ID. Returns full detail: name, email, phone, tags, source, custom fields, and timestamps. |
| `leadconnector_list_pipelines` | List all sales pipelines and their stages in the account. Returns a {pipelines:[...]} envelope with pipeline IDs, names, and ordered stages. Use the returned pipeline ID with leadconnector_list_opportunities. |
| `leadconnector_list_opportunities` | List opportunities (pipeline deals) for a given pipeline. Requires a pipelineId (get one from leadconnector_list_pipelines). Returns deals with monetary value, stage, status, and the associated contact. |
| `leadconnector_list_campaigns` | List marketing/automation campaigns in the account. Returns a {campaigns:[...]} envelope with campaign IDs, names, and status. Useful for finding a campaign to attribute or enroll contacts. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "leadconnector": {
      "url": "https://gateway.pipeworx.io/leadconnector/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Leadconnector data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
