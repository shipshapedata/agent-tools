# shipshape-data

CLI and SDK for the [Shipshape Data](https://shipshapedata.com/) public API. Keyless, read-only, zero dependencies.

Shipshape Data is a London AI consultancy that builds the data foundation first. This package gives you and your agents the whole surface from a terminal or Node script: the services, the case studies with real outcomes, a searchable library of 169 practical guides on data and AI, and the 16-question AI readiness assessment with server-side scoring.

## CLI

```bash
npx shipshape-data readiness          # take the AI readiness assessment in your terminal
npx shipshape-data search data lineage
npx shipshape-data ask "what is a lakehouse"
npx shipshape-data services
npx shipshape-data cases 1nce
npx shipshape-data score 3,2,1,3,2,3,2,3,3,2,2,3,3,3,4,3
```

Add `--json` for machine output. No API key, no sign-up; fair use is 300 requests a minute per IP.

## SDK

```js
const { ShipshapeClient } = require('shipshape-data');
const client = new ShipshapeClient();

const { results } = await client.searchResources('data lineage', { limit: 3 });
const result = await client.scoreReadiness([3,2,1,3,2,3,2,3,3,2,2,3,3,3,4,3]);
console.log(result.score, result.band.name);
```

## The rest of the surface

- API docs and quickstart: https://shipshapedata.com/developers/
- OpenAPI 3.1 spec: https://shipshapedata.com/openapi.json
- MCP servers: `https://shipshapedata.com/mcp` (product) and `https://shipshapedata.com/mcp/docs` (docs Q&A)
- Agent guide: https://shipshapedata.com/agents.md
- Python package: `pip install shipshape-data`

MIT © Disruptiv Technologies Ltd, trading as Shipshape Data
