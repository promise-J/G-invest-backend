require("dotenv").config();
const express = require("express");
const cors = require("cors")
const { coinbaseInit } = require("./coinpayment");
const router = require("./router");
require("./config/database").connect();

const Charge = coinbaseInit();

const app = express();

const port = process.env.PORT || 5000;

// cors({origin: "*"})
app.use(cors())


app.use(express.json());

app.use("/api", router)


app.post("/charge", (req, res) => {
  let chargeData = {
    name: req.body.name,
    description: req.body.description,
    local_price: {
      amount: req.body.amount,
      currency: "USD",
    },
    pricing_type: "fixed_price",
  };
  Charge.create(chargeData, (err, response) => {
    if (err) {
      return res.status(401).json(`Error: ${err}`);
    }
    res.status(200).json(response);
  });
});

app.post("/status", (req, res) => {
  let id = req.body.id;
  if (!id) return res.status(401).json("Id must be provided");
  Charge.retrieve(id, (err, charge) => {
    if (charge["timeline"][0]["status"] == "NEW") {
      try {
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
          return res.status(200).send({ message: "Payment completed." });
        }
      } catch (err) {
        return res.status(200).send({ message: "No payment detected" });
      }
    } else {
      return res.status(400).send({ message: "Charge not found." });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on Port ${port}`);
});
