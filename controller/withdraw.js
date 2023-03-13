const { Transaction } = require("../models/transaction");
const { PAYMENT_TYPE } = require("../util/Constants");

module.exports = {
  createWithdrawal: async (req, res) => {
    const { amount, paymentType, paymentAddress } = req.body;
    if (typeof parseInt(amount) != "number")
      return res.status(401).json("Amount must be a number");
    if (!amount || !paymentAddress || !paymentType)
      return res.status(401).json("Fields must be complete");
    if (!PAYMENT_TYPE.includes(paymentType))
      return res.status(401).json("Provide a valid payment type");
    try {
      const transactionData = {
        user: req.user.id,
        amount: +amount,
        mode: paymentType,
        paymentAddress,
        type: "withdraw",
        // transactionId:
      };
      const newTransaction = new Transaction(transactionData);
      await newTransaction.save();
      return res.status(200).json(newTransaction)
    } catch (error) {
      console.log(error, "from withdraw");
      return res.status(500).json(error);
    }
  },
  updateWithdrawal: async (req, res) => {
    try {
      const { id } = req.params;
      const txn = await Transaction.findOne({ transactionId: id });
      if (!txn) return res.status(401).json("Transaction not found");
      const upTxn = await Transaction.findOneAndUpdate(
        { transactionId: id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(upTxn);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAllWithdrawal: async (req, res) => {
    try {
      const allWithdrawal = await Transaction.find({ type: "withdraw" });
      return res.status(200).json(allWithdrawal);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
