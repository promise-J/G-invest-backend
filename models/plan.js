const mongoose = require("../services/mongoose");
const { Transaction } = require("./transaction.model");

const planSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  desc: {
    type: String,
    required: true,
  },

  default: {
    type: Boolean,
    default: false,
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  duration: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  referralPercent: {
    type: Number,
    required: true,
  },

  // deposits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

  created_on: {
    type: Date,
    default: Date.now,
  },
});

planSchema.methods.getDeposits = async function (user) {
  const active_deposits = await Transaction.find(
    {
      plan: this,
      type: "deposit",
      status: "LOCKED",
      user,
    },
    null,
    {
      sort: {
        created_on: -1,
      },
    }
  );

  return active_deposits;
};
const Plan = mongoose.model("Plan", planSchema);

module.exports = { Plan };
