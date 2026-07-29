const jwt = require('jsonwebtoken');
const cookieParser= require('cookie-parser');





function isLoggedIn(req,res,next){
    if(!req.cookies || !req.cookies.token) return res.redirect("/user/login");
    else{
        let data=jwt.verify(req.cookies.token,process.env.SECURITY_KEY);
        req.user=data;
        next();
    }
}

module.exports= isLoggedIn;