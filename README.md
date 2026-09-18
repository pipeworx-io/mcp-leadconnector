# mcp-leadconnector

LeadConnector / GoHighLevel MCP Pack — wraps the GoHighLevel CRM for AI agents.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/leadconnector/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Leadconnector data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/leadconnector_list_contacts`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
