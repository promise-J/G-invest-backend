const mongoose = require("mongoose");
const { PAYMENT_TYPE } = require("../util/Constants");

// const modeEnum = ["btc", "eth", "ltc", "pm", "wallet", "ltct"];
const modeEnum = PAYMENT_TYPE;

const transactionTypeEnum = [
  "withdraw",
  "deposit",
  "earning",
  "referral",
  "invest",
];

const TransactionSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: transactionTypeEnum,
  },
  mode: {
    type: String,
    required: true,
    enum: modeEnum,
  },
  status: {
    type: String,
    default: "PENDING",
    enum: ["AVAILABLE", "LOCKED", "PENDING", "DECLINED", "WITHDRAWN", "ONGOING"],
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: {
    type: Number,
    required: true,
  },
  paymentAddress: {
    type: String,
    // required: true
  },
  plan: { type: String },

  transactionId: String,
},{timestamps: true});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = { Transaction };
