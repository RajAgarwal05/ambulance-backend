// models/Driver.js
const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ambulanceNumber: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  socketId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
