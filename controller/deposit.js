const { Transaction } = require("../models/transaction");

const { PAYMENT_TYPE } = require("../util/Constants");
const { coinbaseInit } = require("../coinpayment");
const Charge = coinbaseInit();

//user, amount, transactionId, mode, type
module.exports = {
  createDeposit: async (req, res) => {
    try {
      let {
        amount,
        paymentType,
        description = "Request to deposit",
      } = req.body;
      if (!amount || !paymentType)
      return res.status(401).json("Please provide complete fields");
      if (typeof parseInt(amount) != "number")
      return res.status(401).json("Amount must be a number");
      if (!PAYMENT_TYPE.includes(paymentType))
      return res.status(401).json("Provide a valid payment type");
      paymentType = paymentType.toLowerCase();
      const transactionData = {
        user: req.user.id,
        amount,
        mode: paymentType,
        type: "deposit",
        // transactionId:
      };
      let chargeData = {
        name: req.body.name,
        description: req.body.description,
        local_price: {
          amount: req.body.amount,
          currency: "USD",
        },
        pricing_type: "fixed_price",
      };
      const response = await Charge.create(chargeData);
      transactionData.transactionId = response.id;
      const newTransaction = new Transaction(transactionData);
      await newTransaction.save();

      res.status(200).json({
        id: response.id,
        paymentTypeAddress: response.addresses[paymentType],
        paymentType,
        message: "Deposit created",
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  checkDeposit: async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(401).json("Please provide a transaction id");
    try {
      Charge.retrieve(id, async (err, charge) => {
        if (charge["timeline"][0]["status"] == "NEW") {
          try {
            const txn = await Transaction.findOne({ transactionId: id });
            if (!txn) return res.status(401).json("Transaction not found");
            if (
              charge["timeline"][1]["status"] == "PEDNING" &&
              charge["timeline"].length == 2
            ) {
              return res
                .status(200)
                .send({ message: "Payment pending, awaiting confirmations." });
            } else if (charge["timeline"][1]["status"] == "EXPIRED") {
              return res.status(400).send({ message: "Payment has expired" });
            } else if (charge["timeline"][2]["status"] == "COMPLETED") {
              txn.transactionId = "AVAILABLE";
              await txn.save();
              return res.status(200).send({ message: "Payment completed." });
            }
          } catch (err) {
            return res.status(200).send({ message: "No payment detected" });
          }
        } else {
          return res.status(400).send({ message: "Charge not found." });
        }
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  checkAllDeposit: async (req, res) => {
    try {
      const allDeposit = await Transaction.find({ type: "deposit", user: req.user.id }).populate('user');
      return res.status(200).json(allDeposit);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateDeposit: async (req, res) => {
    const { id } = req.params;

    try {
      const txn = await Transaction.findOne({ transactionId: id });
      if (!txn) return res.status(401).json("No Transaction found");
      const updatedTxn = await Transaction.findOneAndUpdate(
        { transactionId: id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedTxn);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  deleteDeposit: async(req, res)=>{
    try {
      const deposit = await Transaction.findById(req.params.id)
      if(!deposit) return res.status(401).json('Deposit not found')
      await Transaction.findByIdAndDelete(req.params.id)
      return res.status(200).json('Deposit Cancelled')
    } catch (error) {
      return res.status(500).json(error)
    }
  }
};
