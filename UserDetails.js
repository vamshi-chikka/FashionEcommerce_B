const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema({
    name : String,
    email : {type: String, unique:true},
    mobile : String,
    password : String
},
{
    collation : "UserInfo" //colleaction name will be the name of our schema where all of our user data will be loacated 
});
mongoose.model("UserInfo",UserDetailSchema)