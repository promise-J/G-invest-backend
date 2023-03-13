const nodemailer = require("nodemailer");
const { template } = require("../htmlTemplate");

// create a transporter object using your email service's SMTP details
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "chiemela30promise@gmail.com",
    pass: "pismumnqshvmxhgw",
  },
});

// function createMail({from, to, subject, text}){
function createMail({to, from, subject}) {
  transporter
    .sendMail({
      from,
      to,
      subject,
      text: "Hello, this is a test email sent from Node.js",
      html: template,
    })
    .then((info) => console.log("Email sent: " + info.response))
    .catch((error) => console.log(error, "Big erorrrrrrrrrr"));
}

module.exports = createMail;
