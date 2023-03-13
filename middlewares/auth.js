const { validateBodyLoginKeys } = require("../helpers/users.helper");
const { verify } = require("jsonwebtoken");

function authCheck(req, res, next) {
  try {
    const authToken = req.headers["authorization"];
    if (!authToken) return res.status(400).json("Not Authorized: No token");
    const user = verify(authToken, process.env.SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.user = {email: decoded.email, id: decoded.id, isAdmin: decoded.isAdmin}
      next();
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

function adminAuthCheck(req, res, next){
  authCheck(req,res, ()=>{
    if(!req.user.isAdmin) return res.status(401).json('You are not an admin')
    next()
  })
}

function checkRequireRegisterField(req, res, next) {
  const { username, email, password, fullName } = req.body;
  if (!username || !email || !password || !fullName) {
    res.status(404).json("Field must be complete");
  } else {
    next();
  }
}
function checkRequireLoginField(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404).json("Field must be complete");
  } else {
    next();
  }
}

module.exports = {
  checkRequireLoginField,
  checkRequireRegisterField,
  authCheck,
  adminAuthCheck
};