const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  users: [{ type: String, required: true }],  // store string IDs
  groupName: String,
  admin: { type: String }                      // store string ID
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
