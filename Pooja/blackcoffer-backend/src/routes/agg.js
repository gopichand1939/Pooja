const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { parseFilters } = require('../utils/parseFilters');

/**
 * GET /api/agg/intensity-by-year
 * Returns avg intensity and count grouped by start_year
 */
router.get('/intensity-by-year', async (req, res) => {
  try {
    const filter = parseFilters(req.query);

    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$start_year',
          avgIntensity: { $avg: { $ifNull: ['$intensity', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const out = await Event.aggregate(pipeline);
    res.json(
      out.map(a => ({
        year: a._id,
        avgIntensity: a.avgIntensity,
        count: a.count
      }))
    );
  } catch (err) {
    console.error('/api/agg/intensity-by-year', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * GET /api/agg/scatter
 * Returns sample points for Intensity vs Likelihood with relevance + impact
 */
router.get('/scatter', async (req, res) => {
  try {
    const filter = parseFilters(req.query);
    const limit = Math.min(5000, Math.max(1, Number(req.query.limit || 1000)));

    const docs = await Event.find(filter, {
      intensity: 1,
      likelihood: 1,
      relevance: 1,
      country: 1,
      topic: 1,
      impact: 1
    })
      .limit(limit)
      .lean();

    const points = docs
      .map(d => ({
        _id: d._id,
        intensity: d.intensity ?? null,
        likelihood: d.likelihood ?? null,
        relevance: d.relevance ?? null,
        impact: d.impact ?? null,
        country: d.country ?? '',
        topic: d.topic ?? ''
      }))
      .filter(p => p.intensity !== null && p.likelihood !== null);

    res.json(points);
  } catch (err) {
    console.error('/api/agg/scatter', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * GET /api/agg/by-country
 * Returns avgIntensity and count grouped by country
 */
router.get('/by-country', async (req, res) => {
  try {
    const filter = parseFilters(req.query);

    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$country',
          avgIntensity: { $avg: { $ifNull: ['$intensity', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    const out = await Event.aggregate(pipeline);
    res.json(
      out.map(a => ({
        country: a._id || 'Unknown',
        avgIntensity: a.avgIntensity,
        count: a.count
      }))
    );
  } catch (err) {
    console.error('/api/agg/by-country', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * GET /api/agg/topics-by-year
 * Returns counts for topics by year
 */
router.get('/topics-by-year', async (req, res) => {
  try {
    const filter = parseFilters(req.query);

    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: { year: '$start_year', topic: '$topic' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id.year',
          topic: '$_id.topic',
          count: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, count: -1 } }
    ];

    const out = await Event.aggregate(pipeline);
    res.json(out);
  } catch (err) {
    console.error('/api/agg/topics-by-year', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * GET /api/agg/city-year-heatmap
 * Returns avgIntensity or count grouped by city & year
 */
router.get('/city-year-heatmap', async (req, res) => {
  try {
    const filter = parseFilters(req.query);
    const metric = req.query.metric === 'avgIntensity' ? 'avgIntensity' : 'count';

    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: { city: '$city', year: '$start_year' },
          avgIntensity: { $avg: { $ifNull: ['$intensity', 0] } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id.city',
          year: '$_id.year',
          value: metric === 'avgIntensity' ? '$avgIntensity' : '$count',
          _id: 0
        }
      },
      { $sort: { city: 1, year: 1 } }
    ];

    const out = await Event.aggregate(pipeline);
    res.json(out);
  } catch (err) {
    console.error('/api/agg/city-year-heatmap', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
