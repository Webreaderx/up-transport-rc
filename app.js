const express= require('express');
const app= express();

const path = require('path');
const cookieParser=require('cookie-parser');
const userRouter=require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const db= require("./config/db");
const userModel= require("./models/user");
const applicationModel= require('./models/application');
const adminModel= require("./models/admin");
const notificationModel= require("./models/notification");
const messageModel = require("./models/message");
const nodemailer = require('nodemailer');


require('dotenv').config();


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.render("index");
})

app.use("/user",userRouter);
app.use("/admin",adminRouter);

app.listen(process.env.PORT);
