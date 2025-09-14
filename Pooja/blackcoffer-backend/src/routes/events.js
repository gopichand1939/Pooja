// src/routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { parseFilters, parsePagination } = require('../utils/parseFilters');

// GET /api/events
// Query params supported:
// topics, topic, sector, region, country, city, pestle, source, swot,
// year_from, year_to, end_year_from, end_year_to,
// min_intensity, max_intensity, min_likelihood, max_likelihood, min_relevance, max_relevance,
// limit, skip, sort, fields, search
router.get('/', async (req, res) => {
  try {
    const q = req.query || {};
    const filter = parseFilters(q);
    const { limit, skip } = parsePagination(q);

    // sorting: support strings like "start_year" or "-intensity"
    const sort = q.sort || '-added';

    // projection: allow a `fields` param as comma-separated list
    let projection = null;
    if (q.fields) {
      projection = q.fields
        .split(',')
        .map(f => f.trim())
        .filter(Boolean)
        .reduce((acc, f) => {
          acc[f] = 1;
          return acc;
        }, {});
    }

    const [total, items] = await Promise.all([
      Event.countDocuments(filter),
      Event.find(filter, projection).sort(sort).skip(skip).limit(limit).lean()
    ]);

    res.json({ total, count: items.length, items });
  } catch (err) {
    console.error('/api/events error', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
