# shipshape-data

Python CLI and SDK for the [Shipshape Data](https://shipshapedata.com/) public API. Keyless, read-only, zero dependencies.

Shipshape Data is a London AI consultancy that builds the data foundation first. This package gives you and your agents the whole surface from Python: the services, the case studies with real outcomes, a searchable library of 169 practical guides on data and AI, and the 16-question AI readiness assessment with server-side scoring.

## CLI

```bash
pip install shipshape-data

shipshape readiness                 # take the AI readiness assessment in your terminal
shipshape search data lineage
shipshape ask "what is a lakehouse"
shipshape score 3,2,1,3,2,3,2,3,3,2,2,3,3,3,4,3
```

## SDK

```python
from shipshape_data import Client

client = Client()
hits = client.search_resources("data lineage", limit=3)
result = client.score_readiness([3, 2, 1, 3, 2, 3, 2, 3, 3, 2, 2, 3, 3, 3, 4, 3])
print(result["score"], result["band"]["name"])
```

No API key, no sign-up; fair use is 300 requests a minute per IP.

## The rest of the surface

- API docs and quickstart: https://shipshapedata.com/developers/
- OpenAPI 3.1 spec: https://shipshapedata.com/openapi.json
- MCP servers: `https://shipshapedata.com/mcp` (product) and `https://shipshapedata.com/mcp/docs` (docs Q&A)
- Node package: `npx shipshape-data`

MIT © Disruptiv Technologies Ltd, trading as Shipshape Data
