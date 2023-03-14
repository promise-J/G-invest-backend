const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const {
  generateRandomString,
  generateAccessToken,
} = require("../helpers/users.helper");
const { Transaction } = require("../models/transaction");
const { User } = require("../models/user");
const createMail = require("../util/sendMail");

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email } = req.body;
      const randomString = generateRandomString();
      const userExists = await User.findOne({ $or: [{ email, username }] });
      if (userExists) return res.status(400).json("User already exists");
      const newUser = new User({ ...req.body, verifyCode: randomString });
      const mailData = {
        to: email,
        from: "admin@gmail.com",
        subject: `Your Verification code is ${randomString}`,
      };
      createMail(mailData);
      await newUser.save();
      res.status(200).json(newUser);
    } catch (error) {
      console.log(error, "the error");
      return res.status(501).json(error);
    }
  },
  regenerateVerfificationCode: async (req, res) => {
    const { email } = req.body;
    try {
      const randomString = generateRandomString();
      const mailData = {
        to: email,
        from: "admin@gmail.com",
        subject: `Your regenerated Verification code is is ${randomString}`,
      };
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json("User not found");
      if (user.verified)
        return res.status(400).json("User is already verified");
      user.verifyCode = randomString;
      await user.save();
      createMail(mailData);
      return res.status(200).json("Verification Code sent");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  verifyUser: async (req, res) => {
    const { verificationCode, email } = req.body;
    try {
      if (!verificationCode || !email)
        return res.status(401).json("Provide code");
      const user = await User.findOne({ email });
      if (user.verifyCode !== verificationCode)
        return res.status(401).json("Wrong code");
      if (user.verified) return res.status(401).json("User already verified");
      user.verified = true;
      await user.save();
      res.status(200).json("Verified");
    } catch (error) {
      console.log(error, "the error");
      return res.status(500).json(error);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      // const emailData = {to: email, from: "app@gmail.com", subject: "Nothing dey happen"}
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json("User not found");
      const passwordIsMatch = await user.verifyPassword(password);
      if (!passwordIsMatch) return res.status(401).json("Wrong Credentials");
      user.lastLogin = new Date();
      await user.save();
      const accessToken = generateAccessToken(user);
      return res.status(200).json({ accessToken, user });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getAllUser: async (req, res) => {
    try {
      const users = await User.find({ isAdmin: false });
      res.status(200).json(users);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  selfUpdate: async (req, res) => {
    try {
      const id = req.user.id;
      const userExists = await User.findById(id);
      if (!userExists) return res.status(400).json("User not found");
      const user = await User.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, select: "-password" }
      );
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      const userExists = await User.findById(userId);
      if (!userExists) return res.status(400).json("User does not exist");
      await User.findByIdAndDelete(userId);
      res.status(200).json("User deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json("User is not found");
      console.log(userpdash, "balance");
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(300).json(error);
    }
  },
  updateUser: async (req, res) => {
    try {
      const {
        phoneNumber,
        country,
        btc,
        eth,
        currPassword,
        newPassword,
        litecoin,
        dogecoin,
      } = req.body;
      const id = req.params.userId;
      // const isAdmin = req.user.isAdmin
      if (id != req.user.id) {
        return res.status(401).json("You are forbidden");
      }
      const user = await User.findById(id);
      if (!user) return res.status(401).json("User not found");
      const newUser = {
        ...(country && { country }),
        ...(eth && { etherumAddress: eth }),
        ...(btc && { bitcoinAddress: btc }),
        ...(litecoin && { litecoinAddress: litecoin }),
        ...(dogecoin && { dogecoinaddress: dogecoin }),
        ...(phoneNumber && { phoneNumber }),
      };
      if (newPassword && currPassword) {
        const isMatch = await user.verifyPassword(currPassword);
        if (!isMatch) {
          return res
            .status(401)
            .json(
              "Passwords ensure you have entered the previous password correctly"
            );
        }
        const hashPassword =  bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
        newUser.password = hashPassword;
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: newUser },
        { new: true, select: "-password" }
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getAccount: async (req, res) => {
    let userId = mongoose.Types.ObjectId(req.user.id);
    // return console.log(userId)
    try {
      const depTxn = await Transaction.aggregate([
        {
          $match: {
            type: "deposit",
            user: userId,
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);
      const invTxn = await Transaction.aggregate([
        {
          $match: {
            type: "invest",
            user: userId,
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);
      const witTxn = await Transaction.aggregate([
        {
          $match: {
            type: "withdraw",
            user: userId,
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);
      const [depRex, invRex, witRex] = await Promise.all([
        depTxn,
        invTxn,
        witTxn,
      ]);

      return res.status(200).json({
        depRex: depRex[0]?.total ? depRex[0].total : 0,
        invRex: invRex[0]?.total ? invRex[0].total : 0,
        witRex: witRex[0]?.total ? witRex[0].total : 0,
      });
    } catch (error) {
      console.log(error, 'from user-account')
      return res.status(500).json(error);
    }
  },
};
