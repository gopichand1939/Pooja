// src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ----- Mongo connection -----
const MONGO = process.env.MONGO_URI;
if (!MONGO) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

mongoose.connect(MONGO)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo connect error', err);
    process.exit(1);
  });

// ----- Try to load model and routers (if they exist) -----
let EventModel = null;
try {
  EventModel = require('./models/Event');
} catch (e) {
  // If models/Event.js doesn't exist, build a loose model so fallback endpoints still work
  console.warn('models/Event.js not found — using fallback loose model.');
  const eventSchema = new mongoose.Schema({}, { strict: false });
  EventModel = mongoose.model('Event', eventSchema, 'events');
}

let eventsRouter = null;
let metaRouter = null;
let aggRouter = null;

const tryRequire = (p) => {
  try {
    return require(p);
  } catch (e) {
    return null;
  }
};

eventsRouter = tryRequire('./routes/events');
metaRouter = tryRequire('./routes/meta');
aggRouter = tryRequire('./routes/agg');

// ----- Mount routers if available -----
if (eventsRouter) {
  app.use('/api/events', eventsRouter);
} else {
  // fallback basic /api/events
  app.get('/api/events', async (req, res) => {
    try {
      const limit = Math.min(100, Number(req.query.limit || 10));
      const skip = Math.max(0, Number(req.query.skip || 0));
      const total = await EventModel.countDocuments();
      const items = await EventModel.find().skip(skip).limit(limit).lean();
      res.json({ total, count: items.length, items });
    } catch (err) {
      console.error('/api/events fallback error', err);
      res.status(500).json({ error: 'server error' });
    }
  });
}

if (metaRouter) {
  app.use('/api/meta', metaRouter);
} else {
  // fallback basic /api/meta
  app.get('/api/meta', async (req, res) => {
    try {
      const fields = ['topic','sector','region','country','pestle','source','city','swot'];
      const meta = {};
      for (const f of fields) {
        meta[f] = await EventModel.distinct(f);
      }
      res.json(meta);
    } catch (err) {
      console.error('/api/meta fallback error', err);
      res.status(500).json({ error: 'server error' });
    }
  });
}

if (aggRouter) {
  app.use('/api/agg', aggRouter);
} else {
  // fallback /api/agg routes (intensity-by-year + scatter)
  app.get('/api/agg/intensity-by-year', async (req, res) => {
    try {
      const { topics, sector, region, pestle, source, country, city, year_from, year_to } = req.query;
      const filter = {};

      const topicParam = topics || req.query.topic;
      if (topicParam) filter.topic = { $in: topicParam.split(',').map(s => s.trim()).filter(Boolean) };
      if (sector) filter.sector = sector;
      if (region) filter.region = region;
      if (pestle) filter.pestle = pestle;
      if (source) filter.source = source;
      if (country) filter.country = country;
      if (city) filter.city = city;

      if ((year_from && year_from !== '') || (year_to && year_to !== '')) {
        filter.start_year = {};
        if (year_from && year_from !== '') filter.start_year.$gte = Number(year_from);
        if (year_to && year_to !== '') filter.start_year.$lte = Number(year_to);
      }

      const pipeline = [
        { $match: filter },
        { $group: { _id: '$start_year', avgIntensity: { $avg: '$intensity' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ];

      const agg = await EventModel.aggregate(pipeline);
      res.json(agg.map(a => ({ year: a._id, avgIntensity: a.avgIntensity, count: a.count })));
    } catch (err) {
      console.error('/api/agg/intensity-by-year fallback error', err);
      res.status(500).json({ error: 'server error' });
    }
  });

  app.get('/api/agg/scatter', async (req, res) => {
    try {
      const limit = Math.min(5000, Math.max(1, Number(req.query.limit || 1000)));
      const docs = await EventModel.find({}, { intensity: 1, likelihood: 1, relevance: 1, country: 1, topic: 1 }).limit(limit).lean();
      const points = docs
        .map(d => ({
          _id: d._id,
          intensity: d.intensity ?? null,
          likelihood: d.likelihood ?? null,
          relevance: d.relevance ?? null,
          country: d.country ?? '',
          topic: d.topic ?? ''
        }))
        .filter(p => p.intensity !== null && p.likelihood !== null);
      res.json(points);
    } catch (err) {
      console.error('/api/agg/scatter fallback error', err);
      res.status(500).json({ error: 'server error' });
    }
  });
}

// ----- Auth route (try to mount ./routes/auth if present) -----
const authRouter = tryRequire('./routes/auth');
if (authRouter) {
  app.use('/api/auth', authRouter);
} else {
  // fallback simple response if auth file not installed
  app.post('/api/auth/login', (req, res) => {
    res.status(500).json({ ok: false, message: 'Auth route not installed on server. Create src/routes/auth.js to enable login.' });
  });
  app.get('/api/auth/me', (req, res) => {
    res.status(500).json({ ok: false, message: 'Auth route not installed on server.' });
  });
}

// ----- Health (useful) -----
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ----- Start server -----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
