const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The field is required MR Ahmad"],
    maxlength: [40, "name can not be more than 20 characters"],
  },
});

const User = mongoose.model("Category", categorySchema);

module.exports = User;
