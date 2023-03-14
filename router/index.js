const {
  createDeposit,
  checkDeposit,
  checkAllDeposit,
  updateDeposit,
  deleteDeposit,
} = require("../controller/deposit");
const { createInvestment, userInvestments } = require("../controller/invest");
const {
  login,
  register,
  deleteUser,
  getAllUser,
  verifyUser,
  regenerateVerfificationCode,
  selfUpdate,
  updateUser,
  getUser,
  getAccount,
} = require("../controller/user");
const {
  createWithdrawal,
  updateWithdrawal,
  getAllWithdrawal,
} = require("../controller/withdraw");
const {
  checkRequireLoginField,
  checkRequireRegisterField,
  authCheck,
  adminAuthCheck,
} = require("../middlewares/auth");

const router = require("express").Router();

//User routes
router.route("/auth/user-fetch").get(authCheck, getUser)
router.route("/auth/login").post(checkRequireLoginField, login);
router.route("/auth/verify").put(verifyUser);
router.route("/auth/regenerate").put(regenerateVerfificationCode);
router.route("/auth/register").post(checkRequireRegisterField, register);
// .put(authCheck, selfUpdate);
router.route("/user/:userId").delete(authCheck, deleteUser);
router.route("/user/:userId").put(authCheck, updateUser);
router.route("/users").get(getAllUser);
//Deposit routes
router
  .route("/deposit")
  .post(authCheck, createDeposit)
  .get(authCheck, checkAllDeposit);
router
  .route("/deposit/:id")
  .put(adminAuthCheck, updateDeposit)
  .delete(authCheck, deleteDeposit);
// router.route("/deposit/all").get(adminAuthCheck,checkAllDeposit)
router.route("/deposit/status/:id").get(authCheck, checkDeposit);

//withdraw
router.route("/withdraw").post(authCheck, createWithdrawal);
router.route("/withdraw/:id").put(authCheck, updateWithdrawal);
router.route("/withdraw/all").get(authCheck, getAllWithdrawal);

//investment
router
  .route("/invest")
  .post(authCheck, createInvestment)
  .get(authCheck, userInvestments);

router.route("/user-account").get(authCheck, getAccount);

module.exports = router;
