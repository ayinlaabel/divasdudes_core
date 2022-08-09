const mongoose = require("mongoose");
const _ = require("lodash");

//JWT secret
const jwtSecret = "MySecret_Divasdudes";

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "user",
  },
  account_name: {
    type: String,
  },
  account_number: {
    type: String,
  },
  bank: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  savings: {
    type: Number,
    default: 0,
  },
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = { Wallet };
