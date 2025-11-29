const mongoose = require("mongoose");

const sosHistorySchema = new mongoose.Schema({
  userPhone: String,
  userLocation: {
    latitude: Number,
    longitude: Number,
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  driverName: String,
  driverPhone: String,
  ambulanceNumber: String,
  status: { type: String, default: "pending" }, // pending, assigned, completed
  assignedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("SosHistory", sosHistorySchema);
