const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const isLoggedIn = require('../middlewere/isLoggedIn');
const generateToken = require('../utils/geterateToken');
const capitalization = require('../utils/capitalization');
const upload = require('../utils/multerUpload');
const adminModel = require('../models/admin');
const userModel = require('../models/user');
const applicationModel = require('../models/application');
const isAdminLoggedin = require('../middlewere/isAdminLoggedin');
const notificationModel = require('../models/notification');
const messageModel = require("../models/message");
const message = require('../models/message');
require("dotenv").config();
const nodemailer = require("nodemailer");
const dns = require("dns");
const sendEmail = require("../utils/sendEmail");

const axios = require("axios");







router.get("/login", async (req, res) => {
    let admins = await adminModel.find();
    let flag = false;
    if (admins.length > 0) {
        flag = true;
    }
    if (!req.cookies || !req.cookies.adminToken) return res.render("adminLogin", { flag });
    else {


        let data = jwt.verify(req.cookies.adminToken, process.env.SECURITY_KEY);
        let admin = await adminModel.findOne({ _id: data.userid });
        if (!admin) {
            res.clearCookie("adminToken");

            return res.render("adminLogin", { flag });
        }
        if (!admin.active) {
            res.clearCookie("adminToken");
            return res.status(400).send("Your Account is currently inactive");
        }
        req.user = data;

        res.redirect("/admin/dashboard");
    }

})
router.get("/register", (req, res) => {
    try {

        res.render("adminRegister");
    } catch (error) {
        res.send(error.message);
    }
})

router.post("/register", async (req, res) => {
    let { fullname, username, mob, dob, password, email } = req.body;

    let admins = await adminModel.find();
    try {
        let admin = await adminModel.findOne({ email: email.toLowerCase() });
        let flag = false;
        if (admins.length === 0) {
            flag = true;
            let message = await messageModel.create({
                flag: false
            })
        }

        if (admin) return res.json({
            success: false,
            message: "Account Already exist"
        });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        admin = await adminModel.create({
            fullname: capitalization(fullname),
            username: capitalization(username),
            email: email.toLowerCase(),
            password: hash,
            dob,
            mob,
            active: true,
            super: flag

        })

        let token = jwt.sign({ email: admin.email, userid: admin._id }, process.env.SECURITY_KEY);
        res.cookie("adminToken", token);

        res.json({
            success: true,
            message: "Account Created"
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }

})

router.get("/dashboard", isAdminLoggedin, async (req, res) => {
    let applications = await applicationModel.find();
    let approved = await applicationModel.find({ status: "Approved" });
    let rejected = await applicationModel.find({ status: "Rejected" });
    let pending = await applicationModel.find({ status: "Pending" });




    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("something went wrong");

    try {

        res.render("adminDashboard", { admin, applications, approved, rejected, pending });

    } catch (error) {
        res.send(error.message);
    }
})

router.post("/profilepic", upload.single("dp"), isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });

    if (!admin) return res.json({
        success: false,
        message: error.message
    });

    try {
        admin.profilepic.data = req.file.buffer;
        admin.profilepic.contentType = req.file.mimetype;
        await admin.save();

        res.json({
            success: true,
            message: "Image Updated"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
})

router.get("/showdp/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.params.id });
    if (!admin) return res.send("Something went wrong");

    try {
        res.contentType(admin.profilepic.contentType);
        res.send(admin.profilepic.data);

    } catch (error) {
        res.send(error.message)
    }
})

router.post("/login", async (req, res) => {
    let admin = await adminModel.findOne({ email: req.body.email.toLowerCase() });
    if (!admin) return res.status(500).send("Account not found with this email");
    if (!admin.active) {
        res.clearCookie("adminToken");
        return res.status(400).send("Your Account is currently inactive");
    }

    try {



        bcrypt.compare(req.body.password, admin.password, (err, result) => {
            if (result) {
                let token = generateToken(admin);
                res.cookie("adminToken", token);

                return res.redirect("/admin/dashboard");

            }
        })

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/logout", isAdminLoggedin, (req, res) => {
    try {
        res.clearCookie("adminToken");
        res.json({
            success: true,
            message: "Logged Out Successfully"
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
})

router.get("/applications", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("something went wrong");
    let applications = await applicationModel.find();
    let approved = await applicationModel.find({ status: "Approved" });
    let rejected = await applicationModel.find({ status: "Rejected" });
    let pending = await applicationModel.find({ status: "Pending" });
    try {
        res.render("adminApplications", { admin, applications, approved, rejected, pending });
    } catch (error) {
        res.send(error.message);
    }

})
router.get("/applicationDetail/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("something went wrong");
    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    let user = await userModel.findOne({ _id: vehicle.user });
    try {
        res.render("adminVehicleDetailByLink", { admin, user, vehicle });
    } catch (error) {
        res.send(error.message);
    }

})

router.get("/showdp1/:id", isAdminLoggedin, async (req, res) => {



    let user = await userModel.findOne({ _id: req.params.id });
    if (!user || !user.profilepic) return res.send("something went wrong");

    res.contentType(user.profilepic.contentType);
    res.send(user.profilepic.data);
})


router.get("/showVehicle/:id", isAdminLoggedin, async (req, res) => {

    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    if (!vehicle || !vehicle.vhImg) return res.send("something went wrong");

    res.contentType(vehicle.vhImg.contentType);
    res.send(vehicle.vhImg.data);
})

router.get("/approve/:id", isAdminLoggedin, async (req, res) => {
    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    if (!vehicle) return res.status(500).json({
        success: false,
        message: "something went wrong"
    });
    let user = await userModel.findOne({ _id: vehicle.user });
    if (!user) return res.status(500).json({
        success: false,
        message: "something went wrong"
    });

    try {
        vehicle.status = "Approved";
        let date = new Date();
        vehicle.approveDate = date;
        await vehicle.save();
        let notification = await notificationModel.create({
            user: vehicle.user,
            titel: "Vehicle Registration Approved",
            content: "Congratulations! Your vehicle " + vehicle.vhNum + " registration application has been approved by the Transport Department. Your registration process has been completed successfully. You can now view your application details from your dashboard.",
            status: 1
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

    subject: "UP Transport RC - Vehicle Registration Approved",

    text: `Dear ${user.fullname},

Congratulations!

We are pleased to inform you that your vehicle registration application has been approved successfully by the Transport Department.

Vehicle Number : ${vehicle.vhNum}
Application Status : Approved

Your registration process has been completed successfully. You can now view your application details from your dashboard at any time.

Thank you for using UP Transport RC.

Regards,
UP Transport RC Team`
});

            } catch (err) {

                console.error("Email failed:", err.message);
            }

            // await transporter.sendMail(mailOptions);

        }


        res.json({
            success: true,
            message: "Vehicle approved"
        })

    } catch (error) {


        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/reject/:id", isAdminLoggedin, async (req, res) => {
    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    if (!vehicle) return res.status(500).json({
        success: false,
        message: "something went wrong"
    });
    let user = await userModel.findOne({ _id: vehicle.user });
    if (!user) return res.status(500).json({
        success: false,
        message: "something went wrong"
    });

    try {
        vehicle.status = "Rejected";
        await vehicle.save();

        let notification = await notificationModel.create({
            user: vehicle.user,
            titel: "Vehicle Registration Application Rejected",
            content: "We regret to inform you that your vehicle " + vehicle.vhNum + " registration application has been rejected after review by the Transport Department. Please review your submitted details and documents, make the necessary corrections, and submit a new application if required.",
            status: 2
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

    subject: "Vehicle Registration Application Update | UP Transport RC",

    text: `Dear ${user.fullname},

Thank you for submitting your vehicle registration application.

After carefully reviewing your application, we regret to inform you that it could not be approved at this time.

Vehicle Number : ${vehicle.vhNum}
Application Status : Rejected

This decision may be due to incomplete information, incorrect details, or issues with the submitted documents.

Please review your application carefully, make the necessary corrections, and submit a new application if required.

We appreciate your understanding and thank you for choosing UP Transport RC.

Regards,
UP Transport RC Team`
});
            } catch (err) {
                console.error("Email failed:", err.message);
            }
        }

        res.json({
            success: true,
            message: "Vehicle rejected"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.get("/applicationsReqested", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("something went wrong");
    let applications = await applicationModel.find();
    let application = await applicationModel.find({ status: "Pending" });
    let approved = await applicationModel.find({ status: "Approved" });
    let rejected = await applicationModel.find({ status: "Rejected" });
    let pending = await applicationModel.find({ status: "Pending" });
    try {
        res.render("adminApplicationRequested", { admin, applications, application, approved, rejected, pending });
    } catch (error) {
        res.send(error.message);
    }

})

router.get("/allVehicles", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.status(500).send("something went wrong");

    try {
        let vehicles = await applicationModel.find({ status: "Approved" }).populate("user");
        res.render("adminVehicles", { admin, vehicles });

    } catch (error) {
        res.status(500).send(error.message);
    }
})


router.get("/searchVehicle", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("Something went wrong");
    let vehicle = null;
    let user = null;
    try {
        res.render("adminSearchVehicleDetail", { admin, vehicle, user });

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/searchVh/:num", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("Something went wrong");
    let vehicle = await applicationModel.findOne({ vhNum: req.params.num.toUpperCase() });

    try {


        if (!vehicle) return res.json({
            success: false,
            message: "vehicle not found"
        })
        else {
            res.json({
                success: true,
                message: "vehicle found"
            })
        }

    } catch (error) {
        res.send("something went wrong");
    }


})

router.get("/searchVhFinStage/:num", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    if (!admin) return res.send("Something went wrong");
    let vehicle = await applicationModel.findOne({ vhNum: req.params.num.toUpperCase() });;
    let user = await userModel.findOne({ _id: vehicle.user });
    try {
        res.render("adminSearchVehicleDetail", { admin, vehicle, user });

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/allAdmins", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    let admins = await adminModel.find();
    try {
        res.render("adminsList", { admin, admins });

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/inActive/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.params.id });
    if (!admin) return res.send("something went wrong");
    try {
        let admins = await adminModel.find({ super: true, active: true });


        if (admins.length > 1) {

            admin.active = false;
            await admin.save();
            return res.json({
                success: true,
                message: "Inactive Successfully"
            })
        }
        else {
            return res.json({
                success: false,
                message: "One super admin should be active"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/disableSuper/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.params.id });
    let admins = await adminModel.find({ super: true });
    if (admins.length <= 1) {
        return res.json({
            success: false,
            message: "At least one Super Admin must remain in the system.The last Super Admin cannot be changed to Admin"
        })
    }

    if (!admin) return res.send("something went wrong");
    try {
        admin.super = false;
        await admin.save();
        res.json({
            success: true,
            message: "super deactivation Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/activeReq/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.params.id });
    if (!admin) return res.send("something went wrong");
    try {
        admin.active = true;
        await admin.save();
        res.json({
            success: true,
            message: "active Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/superAdmin/:id", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.params.id });
    if (!admin) return res.send("something went wrong");
    try {
        admin.super = true;
        await admin.save();
        res.json({
            success: true,
            message: "super active Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.get("/appDelete/:id", isAdminLoggedin, async (req, res) => {

    let vehicle = await applicationModel.findOne({ _id: req.params.id });
    if (!vehicle) return res.status(500).json({
        success: false,
        message: "something went wrong"
    })
    let user = await userModel.findOne({ _id: vehicle.user });
    if (!user) return res.status(500).json({
        success: false,
        message: "something went wrong"
    })

    try {
        user.applications.pull(vehicle._id);
        user.save();
        await applicationModel.findOneAndDelete({ _id: vehicle._id });

        res.json({
            success: true,
            message: "deletion successfull"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }

})

router.get("/addAdmin", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });

    try {
        res.render("adminAddAdmin", { admin });

    } catch (error) {
        res.send(error.message)
    }
})

router.get("/transformAdmin/:email", isAdminLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.params.email.toLowerCase() });
    let adminPresent = await adminModel.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
        return res.json({
            success: false,
            message: "User Not found with this email id"
        })
    }
    if (adminPresent) {
        return res.json({
            success: false,
            message: "Admin already present with this email id"
        })
    }
    try {



        let admin = await adminModel.create({
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            password: user.password,
            dob: user.dob,
            mob: user.mob,
            active: true,
            super: false
        })

        res.json({
            success: true,
            message: "Account created"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }

});

router.get("/adminControlPanel", isAdminLoggedin, async (req, res) => {
    let admin = await adminModel.findOne({ _id: req.user.userid });
    let status = await messageModel.find();
    let flag = await status[0].flag;


    try {
        res.render("adminControlPanel", { admin, flag });

    } catch (error) {
        res.send(error.message);
    }
})

router.get("/messageOn", isAdminLoggedin, async (req, res) => {
    try {

        let message = await messageModel.find();
        if (!message) return res.json({
            success: false,
            message: "Something went wrong"
        })


        message[0].flag = true;

        await message[0].save();

        res.json({
            success: true,
            message: "Message ON"
        })
    } catch (error) {
        res.status(500).json({
            success: true,
            message: error.message
        })
    }
})
router.get("/messageOff", isAdminLoggedin, async (req, res) => {
    try {

        let message = await messageModel.find();
        if (!message) return res.json({
            success: false,
            message: "Something went wrong"
        })


        message[0].flag = false;

        await message[0].save();

        res.json({
            success: true,
            message: "Message OFF"
        })
    } catch (error) {
        res.status(500).json({
            success: true,
            message: error.message
        })
    }
})

router.get("/deleteUserByEmail/:email", isAdminLoggedin, async (req, res) => {
    try {

        let user = await userModel.findOne({ email: req.params.email });
        if (!user) return res.json({
            success: false,
            message: "User not found with this email"
        })
        for (const e of user.applications) {
            await applicationModel.findOneAndDelete({ _id: e._id });
        }
        for (const e of user.notifications) {
            await notificationModel.findOneAndDelete({ _id: e._id });
        }
        await userModel.findOneAndDelete({ email: req.params.email });

        res.json({
            success: true,
            message: "Account Deleted Successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/deleteAdminByEmail/:email", isAdminLoggedin, async (req, res) => {
    try {

        let admin = await adminModel.findOne({ email: req.params.email });
        if (!admin) return res.json({
            success: false,
            message: "Admin not found with this email"
        })

        await adminModel.findOneAndDelete({ email: req.params.email });

        res.json({
            success: true,
            message: "Account Deleted Successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/deleteAllUsers", isAdminLoggedin, async (req, res) => {
    try {

        let users = await userModel.find();
        for (const user of users) {
            for (const e of user.applications) {
                await applicationModel.findOneAndDelete({ _id: e._id });
            }
            for (const e of user.notifications) {
                await notificationModel.findOneAndDelete({ _id: e._id });
            }
        }
        await userModel.deleteMany({});


        res.json({
            success: true,
            message: "Accounts deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/deleteAllAdmins", isAdminLoggedin, async (req, res) => {
    try {


        await adminModel.deleteMany({ super: false });


        res.json({
            success: true,
            message: "Accounts deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/deleteAllVehicles", isAdminLoggedin, async (req, res) => {
    try {


        let vehicles = await applicationModel.find();

        for (const e of vehicles) {
            let user = await userModel.findOne({ _id: e.user });
            user.applications.pull(e._id);

            await user.save();
            await applicationModel.findOneAndDelete({ _id: e._id });
        }



        res.json({
            success: true,
            message: "Accounts deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get("/deleteAllNotifications", isAdminLoggedin, async (req, res) => {
    try {


        let notifications = await notificationModel.find();

        for (const e of notifications) {
            let user = await userModel.findOne({ _id: e.user });
            user.notifications.pull(e._id);

            await user.save();
            await notificationModel.findOneAndDelete({ _id: e._id });
        }



        res.json({
            success: true,
            message: "Accounts deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})



module.exports = router;