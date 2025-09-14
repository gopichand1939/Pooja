const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/meta
router.get('/', async (req, res) => {
  try {
    const fields = [
      'topic',
      'sector',
      'region',
      'country',
      'pestle',
      'source',
      'city',
      'swot',
      'end_year'   // added end_year
    ];

    const meta = {};
    for (const f of fields) {
      meta[f] = await Event.distinct(f, { [f]: { $ne: "" } }); // ignore blanks
    }

    res.json(meta);
  } catch (err) {
    console.error('/api/meta', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
