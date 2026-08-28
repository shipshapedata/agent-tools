"""Shipshape Data SDK: a thin, dependency-free client for the public read API.

Keyless and read-only. Docs: https://shipshapedata.com/developers/
OpenAPI spec: https://shipshapedata.com/openapi.json
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request

__version__ = "1.0.0"
DEFAULT_BASE = "https://shipshapedata.com/api"
_UA = f"shipshape-data-py/{__version__}"


class ShipshapeError(Exception):
    """Raised when the API returns an error response."""

    def __init__(self, status: int, body: dict):
        detail = (body.get("error") or {}).get("message", "request failed") if isinstance(body, dict) else "request failed"
        super().__init__(f"Shipshape API {status}: {detail}")
        self.status = status
        self.body = body


class Client:
    """Client for the Shipshape Data public API. No auth needed anywhere."""

    def __init__(self, base: str = DEFAULT_BASE):
        self.base = base.rstrip("/")

    def _request(self, path: str, params: dict | None = None, payload: dict | None = None, root: bool = False):
        base = self.base[: -len("/api")] if root and self.base.endswith("/api") else self.base
        url = base + path
        if params:
            clean = {k: v for k, v in params.items() if v not in (None, "")}
            if clean:
                url += "?" + urllib.parse.urlencode(clean)
        data = json.dumps(payload).encode() if payload is not None else None
        req = urllib.request.Request(
            url,
            data=data,
            headers={"User-Agent": _UA, "Accept": "application/json", "Content-Type": "application/json"},
            method="POST" if payload is not None else "GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode())
        except urllib.error.HTTPError as err:
            try:
                body = json.loads(err.read().decode())
            except Exception:
                body = {}
            raise ShipshapeError(err.code, body) from None

    def services(self, slug: str | None = None) -> dict:
        """All 13 services, or one by slug."""
        return self._request(f"/v1/services/{slug}" if slug else "/v1/services")

    def industries(self) -> dict:
        """The 6 industry pages."""
        return self._request("/v1/industries")

    def case_studies(self, slug: str | None = None) -> dict:
        """The 3 case studies with real outcomes, or one by slug."""
        return self._request(f"/v1/case-studies/{slug}" if slug else "/v1/case-studies")

    def search_resources(self, query: str, category: str | None = None, limit: int = 5) -> dict:
        """Search the 169-guide resources library."""
        return self._request("/v1/resources", params={"q": query, "category": category, "limit": limit})

    def resource_categories(self) -> dict:
        """The seven resource categories with counts."""
        return self._request("/v1/resources/categories")

    def readiness_questions(self) -> dict:
        """The 16-question AI readiness assessment."""
        return self._request("/v1/ai-readiness/questions")

    def score_readiness(self, answers: list[int]) -> dict:
        """Score assessment answers.

        Accepts 16 option indices (0-4, all questions in order) or 15 point
        values (1-5, scored questions only, in order). Stateless: nothing is stored.
        """
        return self._request("/v1/ai-readiness/score", payload={"answers": answers})

    def ask(self, query: str) -> dict:
        """Ask a question over the NLWeb endpoint; ranked results from the site's content."""
        return self._request("/ask", payload={"query": query}, root=True)

    def contact(self) -> dict:
        """How to reach the team (there are deliberately no write endpoints)."""
        return self._request("/v1/contact")
