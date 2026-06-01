interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * LeadConnector / GoHighLevel MCP Pack — wraps the GoHighLevel CRM for AI agents.
 *
 * BYO key: pass _apiKey on every call. This is a GoHighLevel/LeadConnector
 * **Location API key** (in the dashboard: Settings → Business Profile → API Key).
 * It is a single static bearer token scoped to one Location (sub-account).
 *
 * API: GoHighLevel v1 REST API — base https://rest.gohighlevel.com/v1
 * Auth: `Authorization: Bearer ${apiKey}`.
 * Quirks:
 *   - Collection responses are wrapped, e.g. {contacts:[...], meta:{...}},
 *     {pipelines:[...]}, {campaigns:[...]}.
 *   - Opportunities are nested under a pipeline: /pipelines/{pipelineId}/opportunities/
 *     (there is no top-level /opportunities/ in v1 — it 404s), so list_opportunities
 *     requires a pipelineId (fetch one first via list_pipelines).
 *   - A missing/invalid key returns HTTP 401 {"msg":"Api key is invalid."}.
 *   - v1 /users/ is deprecated for Location keys (401 "Switch to the new API token"),
 *     so no users tool is exposed.
 */


const API = 'https://rest.gohighlevel.com/v1';

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
    'User-Agent': 'pipeworx-mcp-leadconnector/1.0 (+https://pipeworx.io)',
  };
}

async function lcGet(apiKey: string, path: string, params?: URLSearchParams): Promise<unknown> {
  const qs = params?.toString();
  const url = `${API}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: headers(apiKey) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LeadConnector: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

// -- Tool definitions --------------------------------------------------------

const tools: McpToolExport['tools'] = [
  {
    name: 'leadconnector_list_contacts',
    description:
      'Search or list CRM contacts in a GoHighLevel/LeadConnector account. Free-text query matches name, email, or phone. Returns a {contacts:[...], meta} envelope with contact IDs, names, emails, phones, tags, and custom fields.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'GoHighLevel/LeadConnector Location API key (Settings → Business Profile → API Key)' },
        query: { type: 'string', description: 'Free-text search across contact name, email, and phone' },
        limit: { type: 'number', description: 'Max contacts to return (default 20, max 100)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'leadconnector_get_contact',
    description:
      'Fetch a single CRM contact by its contact ID. Returns full detail: name, email, phone, tags, source, custom fields, and timestamps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'GoHighLevel/LeadConnector Location API key' },
        contactId: { type: 'string', description: 'GoHighLevel contact ID' },
      },
      required: ['_apiKey', 'contactId'],
    },
  },
  {
    name: 'leadconnector_list_pipelines',
    description:
      'List all sales pipelines and their stages in the account. Returns a {pipelines:[...]} envelope with pipeline IDs, names, and ordered stages. Use the returned pipeline ID with leadconnector_list_opportunities.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'GoHighLevel/LeadConnector Location API key' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'leadconnector_list_opportunities',
    description:
      'List opportunities (pipeline deals) for a given pipeline. Requires a pipelineId (get one from leadconnector_list_pipelines). Returns deals with monetary value, stage, status, and the associated contact.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'GoHighLevel/LeadConnector Location API key' },
        pipelineId: { type: 'string', description: 'Pipeline ID to list opportunities for (from leadconnector_list_pipelines)' },
        limit: { type: 'number', description: 'Max opportunities to return (default 20, max 100)' },
      },
      required: ['_apiKey', 'pipelineId'],
    },
  },
  {
    name: 'leadconnector_list_campaigns',
    description:
      'List marketing/automation campaigns in the account. Returns a {campaigns:[...]} envelope with campaign IDs, names, and status. Useful for finding a campaign to attribute or enroll contacts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'GoHighLevel/LeadConnector Location API key' },
      },
      required: ['_apiKey'],
    },
  },
];

// -- callTool dispatcher -----------------------------------------------------

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string | undefined;
  delete args._context;
  delete args._apiKey;

  if (!apiKey) throw new Error('_apiKey is required for LeadConnector/GoHighLevel API access');

  switch (name) {
    case 'leadconnector_list_contacts': {
      const params = new URLSearchParams();
      if (args.query) params.set('query', String(args.query));
      if (args.limit) params.set('limit', String(Math.min(100, Number(args.limit))));
      return lcGet(apiKey, '/contacts/', params);
    }
    case 'leadconnector_get_contact':
      return lcGet(apiKey, `/contacts/${encodeURIComponent(String(args.contactId))}`);
    case 'leadconnector_list_pipelines':
      return lcGet(apiKey, '/pipelines/');
    case 'leadconnector_list_opportunities': {
      const params = new URLSearchParams();
      if (args.limit) params.set('limit', String(Math.min(100, Number(args.limit))));
      return lcGet(apiKey, `/pipelines/${encodeURIComponent(String(args.pipelineId))}/opportunities/`, params);
    }
    case 'leadconnector_list_campaigns':
      return lcGet(apiKey, '/campaigns/');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
