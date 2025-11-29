const mongoose = require("mongoose");

// Agar schema already define hai:
const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  location: { latitude: Number, longitude: Number },
  sosSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Model create karo
const User = mongoose.model("User", userSchema);

// Export karo taaki dusre files me use ho sake
module.exports = User;
