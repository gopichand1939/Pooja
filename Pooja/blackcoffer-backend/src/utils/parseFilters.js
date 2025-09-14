// src/utils/parseFilters.js
// Converts query params into a MongoDB filter object.
// Supports comma-separated multi-selects and numeric ranges.
// Handles: topics, sector, region, country, city, pestle, source, swot,
// start_year (year_from/year_to), end_year (end_year_from/end_year_to),
// intensity/likelihood/relevance numeric ranges, optional text search.

function toNumberOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function multiParam(q, key, target, filter) {
  if (!q[key] && !q[target]) return;
  const raw = q[key] || q[target];
  const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (arr.length) filter[target || key] = { $in: arr };
}

function parseRange(q, lowKey, highKey, fieldName, filter) {
  const low = toNumberOrNull(q[lowKey]);
  const high = toNumberOrNull(q[highKey]);
  if (low === null && high === null) return;
  filter[fieldName] = {};
  if (low !== null) filter[fieldName].$gte = low;
  if (high !== null) filter[fieldName].$lte = high;
}

function parseFilters(q = {}) {
  const filter = {};

  // Multi-select / string filters
  multiParam(q, 'topics', 'topic', filter);
  multiParam(q, 'topic', 'topic', filter);
  multiParam(q, 'sector', 'sector', filter);
  multiParam(q, 'region', 'region', filter);
  multiParam(q, 'country', 'country', filter);
  multiParam(q, 'city', 'city', filter);
  multiParam(q, 'pestle', 'pestle', filter);
  multiParam(q, 'source', 'source', filter);
  multiParam(q, 'swot', 'swot', filter); // ⚠️ dataset may not contain this field

  // Year ranges
  parseRange(q, 'year_from', 'year_to', 'start_year', filter);
  parseRange(q, 'end_year_from', 'end_year_to', 'end_year', filter);

  // Numeric ranges
  parseRange(q, 'min_intensity', 'max_intensity', 'intensity', filter);
  parseRange(q, 'min_likelihood', 'max_likelihood', 'likelihood', filter);
  parseRange(q, 'min_relevance', 'max_relevance', 'relevance', filter);

  // Optional text search across title & insight
  if (q.search && q.search.trim()) {
    const s = q.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { insight: { $regex: s, $options: 'i' } }
    ];
  }

  return filter;
}

// Pagination helper
function parsePagination(q = {}) {
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 10)); // default 10, max 100
  const skip = Math.max(0, Number(q.skip) || 0);
  return { limit, skip };
}

module.exports = { parseFilters, parsePagination };
