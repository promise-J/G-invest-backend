const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const shortid = require("shortid");
const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyCode: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  country: {
    type: String
  },
  // perfectMoneyAccount: {
  //   type: String,
  // },
  // perfectMoneyAccountName: {
  //   type: String,
  // },
  etherumAddress: {
    type: String,
  },
  bitcoinAddress: {
    type: String,
  },
  litecoinAddress: {
    type: String,
  },
  dogecoinaddress: {
    type: String,
  },
  secretQuestion: {
    type: String,
  },
  secretAnswer: {
    type: String,
  },
  balance: {
    type: Number,
    default: 1000
  },

  //ADMIN SPECIFIC
  coinPaymentMerchantId: {
    type: String,
  },
  coinPaymentIpnSecret: {
    type: String,
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  // refCode: {
  //   type: String,
  //   required: true,
  //   default: shortid.generate,
  // },
  isActive: {
    type: Boolean,
    default: false,
  },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Returns object fields that can be altered

UserSchema.methods.getEditableFields = function () {
  return [
    "fullName",
    "bitcoinAddress",
    "etherumAddress",
    "litecoinAddress",
    "perfectMoneyAccount",
    "perfectMoneyAccountName",
    "email",
  ];
};

UserSchema.methods.adminFlexibleFields = function () {
  const obj = {};
  [
    "fullName",
    "coinPaymentMerchantId",
    "coinPaymentIpnSecret",
    "perfectMoneyAccount",
    "perfectMoneyAccountName",
    "email",
  ].forEach((f) => (obj[f] = this[f] || ""));
  return obj;
};

UserSchema.methods.flexibleFields = function () {
  const obj = {};
  this.getEditableFields().forEach((f) => (obj[f] = this[f]));
  return obj;
};

UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.getAvailableBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        // status: { $in: ["AVAILABLE", "WITHDRAWN"] },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$type", "withdraw"] },
                  { $eq: ["$type", "Invest"] },
                ],
              },
              { $multiply: ["$amount", -1] },
              "$amount",
            ],
          },
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getTotalBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        status: { $in: ["AVAILABLE", "WITHDRAWN", "LOCKED"] },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$type", "withdraw"] },
                  { $eq: ["$type", "InvestWith"] },
                ],
              },
              { $multiply: ["$amount", -1] },
              "$amount",
            ],
          },
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getLockedDepositsBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        type: "deposit",
        status: { $eq: "LOCKED" },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getWithdrawnBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        type: "withdraw",
        status: { $eq: "WITHDRAWN" },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getPendingWithdrawBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        type: "withdraw",
        status: { $eq: "PENDING" },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getEarnedBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        type: "earning",
        status: { $eq: "AVAILABLE" },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.getAffliateBalance = async function () {
  const value = await this.model("Transaction").aggregate([
    {
      $match: {
        user: this._id,
        type: "referral",
        status: { $eq: "AVAILABLE" },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return value[0] ? value[0].amount : 0;
};

UserSchema.methods.latestDepositDate = async function () {
  const deposit = await this.model("Transaction").findOne(
    { type: "deposit", status: { $ne: "PENDING" }, user: this },
    null,
    {
      sort: {
        created_on: -1,
      },
    }
  );

  return deposit ? deposit.created_on : null;
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
