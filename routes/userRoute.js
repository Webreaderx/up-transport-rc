const express = require('express');
const router = express.Router();

const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const capitalization = require('../utils/capitalization');
const generateToken = require("../utils/geterateToken");
const isLoggedIn = require("../middlewere/isLoggedIn");
const noCache = require('../middlewere/noCache');
const upload = require('../utils/multerUpload');
const applicationModel = require('../models/application');
const isAdminLoggedin = require('../middlewere/isAdminLoggedin');
const notificationModel = require("../models/notification");
require("dotenv").config();
const nodemailer = require("nodemailer");
const messageModel = require("../models/message");
const sendEmail = require("../utils/sendEmail");

const axios = require("axios");


router.use(cookieParser());



router.get("/login", async (req, res) => {

    if (!req.cookies || !req.cookies.token) return res.render("userLogin");
    else {
        let data = jwt.verify(req.cookies.token, process.env.SECURITY_KEY);
        let user = await userModel.findOne({ _id: data.userid });
        if (!user) {
            res.clearCookie("token");

            return res.render("userLogin");
        }
        req.user = data;
        res.redirect("/user/dashboard");
    }

});

router.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.send("user not found");

    try {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                let token = generateToken(user);
                res.cookie("token", token);
                return res.redirect("/user/dashboard");
            }
            else {
                res.send("Sorry password incorrect");
            }
        })

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/register", (req, res) => {

    try {

        res.render("register");
    } catch (error) {
        res.send(error.message);
    }
})

router.post("/register", async (req, res) => {
    let { fullname, username, email, mob, dob, password } = req.body;
    try {

        let user = await userModel.findOne({ email: req.body.email.toLowerCase() });
        if (user) return res.send("User already registered");
        await bcrypt.genSalt(10, async (err, salt) => {
            await bcrypt.hash(password, salt, async (err, hash) => {
                user = await userModel.create({
                    fullname: capitalization(req.body.fullname),
                    username: capitalization(req.body.username),
                    email: req.body.email.toLowerCase(),
                    mob,
                    dob,
                    password: hash
                });



                let token = generateToken(user);
                res.cookie("token", token);
                res.redirect("/user/dashboard");





            })
        })





    } catch (error) {
        res.send(error.message);
    }
})


router.get("/dashboard", noCache, isLoggedIn, async (req, res) => {



    let user = await userModel.findOne({ _id: req.user.userid });
    let approved = await applicationModel.find({ user: user._id, status: "Approved" });
    let rejected = await applicationModel.find({ user: user._id, status: "Rejected" });
    let pending = await applicationModel.find({ user: user._id, status: "Pending" });
    if (!user) return res.send("Something went wrong");




    try {
        res.render("userDashboard", { user, approved, rejected, pending });

    } catch (error) {
        console.log(error.message);

    }
})


router.get("/logout", isLoggedIn, (req, res) => {
    try {
        res.clearCookie("token");
        res.redirect("/user/login");
    } catch (error) {
        res.send(error.message);
    }
})

router.post("/profilepic", isLoggedIn, upload.single("dp"), async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid });
    if (!user) return res.json({
        success: false,
        message: error.message
    });

    try {
        user.profilepic.data = req.file.buffer;
        user.profilepic.contentType = req.file.mimetype;
        await user.save();

        res.json({
            success: true,
            message: "Image Updated"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

})

router.get("/showdp/:id", isLoggedIn, async (req, res) => {

    let user = await userModel.findOne({ _id: req.user.userid });
    if (!user || !user.profilepic) return res.send("something went wrong");

    res.contentType(user.profilepic.contentType);
    res.send(user.profilepic.data);
})
router.get("/showVehicle/:id", isLoggedIn, async (req, res) => {

    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    if (!vehicle || !vehicle.vhImg) return res.send("something went wrong");

    res.contentType(vehicle.vhImg.contentType);
    res.send(vehicle.vhImg.data);
})

router.get("/vehicle", noCache, isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid });
    if (!user) return res.send("something went wrong");

    res.render("userVehicleRegister", { user });
})

router.post("/vehicle", upload.single("vhImg"), isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid });



    let { vhType, manufacturer, vhModel, vhNum, hp, ono, add, fuel, rto } = req.body;
    let application = await applicationModel.findOne({ vhNum: req.body.vhNum.toUpperCase() });
    if (application && application.status != "Rejected") return res.send("Application already registered");

    try {
        application = await applicationModel.create({
            aplId: (Date.now() + req.body.vhNum.toUpperCase()),
            user: req.user.userid,
            vhType,
            manufacturer,
            vhModel,
            vhNum: vhNum.toUpperCase(),
            hp,
            ono,
            add,
            fuel,
            rto,
            status: "Pending",
            vhImg: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }

        });
        user.applications.push(application._id);

        let notification = await notificationModel.create({
            user: application.user,
            titel: "Application Submitted Successfully",
            content: "Your vehicle " + application.vhNum + " registration application has been submitted successfully. It is now under review by the Transport Department. We will notify you once the verification process has been completed.",
            status: 3
        })
        user.notifications.push(notification._id);
        await user.save();

       





        // Send Email
        const messages = await messageModel.find();
        const indicator = messages[0].flag;


        if (indicator) {

try {
    await sendEmail({
        to: user.email,

        subject: "UP Transport RC - Vehicle Registration Submitted",

        text: `Dear ${user.fullname},

Thank you for choosing UP Transport RC.

We are pleased to inform you that your vehicle registration application has been submitted successfully and is now under review by the Transport Department.

Vehicle Number : ${application.vhNum}
Application Status : Under Review

Our team will carefully verify the information and documents you have provided. Once the review process has been completed, you will receive another notification regarding the status of your application.

Thank you for using UP Transport RC.

Regards,
UP Transport RC Team`
    });
} catch (err) {
    console.error("Application Submission Email Failed:");
    console.error(err.message);
}



        }

        res.redirect("/user/dashboard");



    } catch (error) {
        res.send(error.message);
    }
})

router.get("/applications", noCache, isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid }).populate("applications");
    let approved = await applicationModel.find({ user: user._id, status: "Approved" });
    let rejected = await applicationModel.find({ user: user._id, status: "Rejected" });
    let pending = await applicationModel.find({ user: user._id, status: "Pending" });

    try {

    } catch (error) {
        res.send(error.message);

    }

    res.render("userApplications", { user, approved, rejected, pending });
})

router.get("/vehicleDetail/:id", noCache, isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid }).populate("applications");
    let vehicle = await applicationModel.findOne({ _id: req.params.id });

    try {

        if (!vehicle) return res.redirect("/user/applications");
        res.render("userVehicleDetail", { user, vehicle });

    } catch (error) {
        res.send(error.message);

    }


})

router.get("/appDelete/:id", isLoggedIn, async (req, res) => {



    let user = await userModel.findOne({ _id: req.user.userid });
    if (!user) return res.send("Something went wrong");
    let application = await applicationModel.findOneAndDelete({ _id: req.params.id });
    if (!application) return res.send("vehicle not found");
    try {

        user.applications.pull(req.params.id);
        await user.save();



        res.json({
            success: true,
            message: "deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.get("/myVehicles", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid });

    if (!user) return res.status(500).send("Something went wrong");

    let vehicles = await applicationModel.find({ user: user._id, status: "Approved" });

    try {
        res.render("userVehicles", { user, vehicles });

    } catch (error) {
        res.send(error.message);
    }



})

router.get("/notifications", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user.userid }).populate("notifications");
    if (!user) return res.send("something went wrong");
    try {
        res.render("userNotification", { user });

    } catch (error) {
        res.send(error.message);
    }


})




module.exports = router;