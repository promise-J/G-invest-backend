const mongoose = require("mongoose");
const { DB_URL } = process.env;

exports.connect = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connection to", DB_URL))
    .catch((error) => {
      console.log("Database connection failed. Exiting");
      console.log(error);
      process.exit(1);
    });
};
