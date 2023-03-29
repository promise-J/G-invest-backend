const { investmentPlans } = require("../data");
const { Transaction } = require("../models/transaction");
const { PAYMENT_TYPE } = require("../util/Constants");
const { coinbaseInit } = require("../coinpayment");
const Charge = coinbaseInit();

module.exports = {
  createInvestment: async (req, res) => {
    try {
      let { amount, planId } = req.body;
      if (!amount || !planId)
      return res.status(401).json("Provide fields");
      if (typeof parseInt(amount) != "number")
      return res.status(401).json("Amount must be a number");
      amount = +amount;
      const investPlan = investmentPlans.find((el) => el.id == planId);
      if (!investPlan) return res.status(401).json("Investment not found");
      console.log(investPlan, 'plan id')
      if (amount < investPlan.min || amount > investPlan.max)
        return res
          .status(404)
          .json(
            `Amount must be in range of the plan. Min: ${investPlan.min}  Max: ${investPlan.max}`
          );

      const transactionData = {
        user: req.user.id,
        amount,
        mode: "usdt",
        type: "invest",
        plan: investPlan.id,
        status: "ONGOING"
        // transactionId:
      };
      const newTransaction = new Transaction(transactionData);
      await newTransaction.save();

      res.status(200).json({
        message: "Investment created",
        investPlan,
        amount
      });
    } catch (error) {
      console.log(error, "from invest");
      return res.status(500).json(error);
    }
  },
  userInvestments: async(req, res)=>{
    try {
      const allDeposit = await Transaction.find({ type: "invest", user: req.user.id }).populate('user');
      return res.status(200).json(allDeposit);
    } catch (error) {
      return res.status(500).json(error)
    }
  }
};
