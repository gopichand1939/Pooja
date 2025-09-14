const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined in env');
  // safe default options
  return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = { connectDB };
