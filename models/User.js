const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
  },
  timespan: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
