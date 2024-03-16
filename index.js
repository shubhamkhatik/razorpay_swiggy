const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config()

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.get("/",(req,res)=>{
    res.status(200).json({ 
        message:"ok",
        data:"successfully get api hits",
        otherRoute1:"/order",
        otherRoute2:"/order/validate   is hits automatically while payment procedure"
    })
})
app.post("/order", async (req, res) => {
  console.log(" body",req.body);

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);
    console.log("order",order);


    if (!order) {
      console.log("order error");
      return res.status(500).send("Error while creating order");

    }
    console.log("order success");

    res.json(order);
  } catch (err) {
    console.log("catch error",err);
    res.status(500).send("Error in catch",err);
  }
});

app.post("/order/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    console.log("signature error");

    return res.status(400).json({ msg: "Transaction is not legit!" });
  }
  console.log("signature success");

  res.json({
    msg: "successfully validate",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});