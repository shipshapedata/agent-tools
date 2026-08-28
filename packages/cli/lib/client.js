'use strict';

/*
 * Shipshape Data SDK: a thin, zero-dependency client for the public read API.
 * Keyless and read-only. API docs: https://shipshapedata.com/developers/
 * OpenAPI spec: https://shipshapedata.com/openapi.json
 */

const DEFAULT_BASE = 'https://shipshapedata.com/api';

class ShipshapeClient {
  constructor(options = {}) {
    this.base = (options.base || DEFAULT_BASE).replace(/\/+$/, '');
    this.userAgent = options.userAgent || 'shipshape-data-js/1.0.0';
  }

  async _get(path, params) {
    const url = new URL(this.base + path);
    for (const [k, v] of Object.entries(params || {})) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    const res = await fetch(url, { headers: { 'User-Agent': this.userAgent, Accept: 'application/json' } });
    const body = await res.json();
    if (!res.ok) throw new ShipshapeError(res.status, body);
    return body;
  }

  async _post(path, payload) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new ShipshapeError(res.status, body);
    return body;
  }

  /** All 13 services, or one by slug. */
  services(slug) { return slug ? this._get('/v1/services/' + encodeURIComponent(slug)) : this._get('/v1/services'); }

  /** The 6 industry pages. */
  industries() { return this._get('/v1/industries'); }

  /** The 3 case studies with real outcomes, or one by slug. */
  caseStudies(slug) { return slug ? this._get('/v1/case-studies/' + encodeURIComponent(slug)) : this._get('/v1/case-studies'); }

  /** Search the 169-guide resources library. */
  searchResources(query, { category, limit } = {}) { return this._get('/v1/resources', { q: query, category, limit }); }

  /** The seven resource categories with counts. */
  resourceCategories() { return this._get('/v1/resources/categories'); }

  /** The 16-question AI readiness assessment. */
  readinessQuestions() { return this._get('/v1/ai-readiness/questions'); }

  /**
   * Score assessment answers. Accepts 16 option indices (0-4, all questions in
   * order) or 15 point values (1-5, scored questions only, in order).
   */
  scoreReadiness(answers) { return this._post('/v1/ai-readiness/score', { answers }); }

  /** Ask a question over the NLWeb endpoint; returns ranked results from the site's content. */
  async ask(query) {
    const res = await fetch(this.base.replace(/\/api$/, '') + '/ask', {
      method: 'POST',
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const body = await res.json();
    if (!res.ok) throw new ShipshapeError(res.status, body);
    return body;
  }

  /** How to reach the team (there are deliberately no write endpoints). */
  contact() { return this._get('/v1/contact'); }
}

class ShipshapeError extends Error {
  constructor(status, body) {
    const detail = body && body.error ? body.error.message : 'request failed';
    super('Shipshape API ' + status + ': ' + detail);
    this.status = status;
    this.body = body;
  }
}

module.exports = { ShipshapeClient, ShipshapeError, DEFAULT_BASE };
