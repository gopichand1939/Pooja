const mongoose = require('mongoose');

// Loose schema so the JSON can be stored without strict validation
const EventSchema = new mongoose.Schema({}, { strict: false, timestamps: false });
module.exports = mongoose.model('Event', EventSchema, 'events');
