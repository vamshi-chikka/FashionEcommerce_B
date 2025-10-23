const express = require('express');
const app = express();
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
app.use(express.json());

require('dotenv').config();
require('./UserDetails')
require('./Order')

const jwt = require('jsonwebtoken');
const Products = require('./Products');

//const mongoURL = "";
//const JWT_SECRET ="hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("mongoose connected");
    })
    .catch((e)=>{
        console.log(e);
    });

 
const User = mongoose.model("UserInfo");
const Order = mongoose.model("OrderInfo")
    
app.get("/",(req,res)=>{
    res.send({status:"Started"})
})

app.post("/register",async(req,res)=>{
    const {name,email,mobile,password} = req.body;
    const oldUser = await User.findOne({email:email});
    if(oldUser){
        return res.send({data:"User already exists!!"});  
    }
    try{
        await User.create({
            name :name,
            email:email,
            mobile,
            password,
        });
        res.send({status: "ok", data:"User Created"});
    }catch(e){
        res.send({status: "error",data: error});
    }
    
});

app.post("/login-user",async(req,res)=>{
    const {email,password} = req.body;
    const oldUser = await User.findOne({email:email});
    if(!oldUser)
    {
        return res.send({data:" User doesn't exists!!"})
    }
    if(password === oldUser.password)
    {
//        const token = jwt.sign({email : oldUser.email}, JWT_SECRET);
        if(res.status(201)){
            return res.send({status:"ok", 
                data: {
                    email:oldUser.email,
                    name : oldUser.name,
                    mobile: oldUser.mobile,
                },
            });
        }else{
            return res.send({error:"error"})
        }
    }
})

app.post("/OrderDetails",async(req,res) =>{
    try {
        const {items,getTotal,userEmail} = req.body;
        console.log(req.body);
        if (!items || !getTotal || !userEmail) {
            return res.status(400).send({status:"error", data:"Missing required fields"});
        }
        await Order.create({
            items : items,
            getTotal,
            userEmail
        })

        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.VENDOR_EMAIL, // your vendor Gmail
            pass: process.env.VENDOR_PASS,
        },
        });

        const itemList = items.map(
        (item) =>
            `• ${item.title} (${item.selectedSize}, ${item.selectedColor}) × ${item.quantity} — $${item.price}`
        ).join("\n");

        await transporter.sendMail({
        from: userEmail,
        to: process.env.VENDOR_EMAIL,
        subject: "🛒 New Order Received!",
        text: `New order details:\n\n${itemList}\n\nTotal: $${getTotal}`,
        });
        res.send({status: "ok", data:"Order Placed Successfully!"});
    }
    catch(e){
    console.error("OrderDetails Error:", e); // 🔹 log the real error
    res.status(500).send({status: "error", data: e.message || "error"});
    }

    

})

app.get("/Products", (req, res) => {
  try {
    res.status(200).json(Products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get all orders for a user
app.get("/getOrders", async (req, res) => {
  try {
    const { userEmail } = req.query; // e.g., /getOrders?userEmail=test@gmail.com

    if (!userEmail) {
      return res.status(400).send({ status: "error", data: "Missing userEmail" });
    }

    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    res.send({ status: "ok", data: orders });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: "error", data: "Server error" });
  }
});

const PORT = process.env.PORT || 5001; // use Render port or local fallback
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
