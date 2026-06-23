'use strict';

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  ips: { type: [String], default: [] } // IPs hasheadas que dieron like
});

module.exports = mongoose.model('Stock', stockSchema);