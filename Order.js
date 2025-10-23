const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    items :Array,
    getTotal: Number,
    userEmail:String,
    createdAt: {
    type: Date,
    default: Date.now,
  }
},
{
    collation : "OrderInfo" //colleaction name will be the name of our schema where all of our user data will be loacated 
});
mongoose.model("OrderInfo",OrderSchema)