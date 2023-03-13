const {sign} = require("jsonwebtoken")

function generateRandomString() {
  const characters =
    "ABC2D3E5FGHI6JKL7MNO9PQ2R1STUVWX6YZabcde4fg4hijk3lmno5pq33rstuvw5xyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
}


function generateAccessToken(user){
  return sign({id: user._id, email: user.email, isAdmin: user.isAdmin}, process.env.SECRET, {expiresIn: '1d'})
}

module.exports = {generateRandomString, generateAccessToken}