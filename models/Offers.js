const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const offerSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.objectId,
    ref: "Product",
    required: true,
  },
  expire_date: {
    type: Date,
    required: true,
  },
});

const User = mongoose.model("Category", categorySchema);

module.exports = User;
