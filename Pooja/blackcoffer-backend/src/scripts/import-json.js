// Minimal importer: reads JSON file, normalizes numeric fields, inserts into `events` collection.
// Usage: node src/scripts/import-json.js ../jsondata.json
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

async function run(filePath) {
  if (!filePath) {
    console.error('Usage: node src/scripts/import-json.js ./jsondata.json');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  const normalized = raw.map(r => {
    const copy = { ...r };
    const toNum = v => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };
    copy.intensity = toNum(copy.intensity);
    copy.likelihood = toNum(copy.likelihood);
    copy.relevance = toNum(copy.relevance);
    copy.start_year = toNum(copy.start_year);
    copy.end_year = toNum(copy.end_year);
    return copy;
  });
  await Event.insertMany(normalized, { ordered: false });
  console.log('Imported', normalized.length, 'documents');
  process.exit(0);
}

run(process.argv[2]).catch(e => { console.error(e); process.exit(1); });
