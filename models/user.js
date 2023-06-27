const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "password must be at least 6 characters long"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: Number,
    otp_expiry: Date,
    forgetPasswordOtp: {
      type: Number,
      default: null,
    },
    forgetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
