const jwt = require('jsonwebtoken');
const cookieParser= require('cookie-parser');





function isAdminLoggedin(req,res,next){
    if(!req.cookies || !req.cookies.adminToken) return res.redirect("/admin/login");
    else{
        
        
        let data=jwt.verify(req.cookies.adminToken,process.env.SECURITY_KEY);
        req.user=data;
        
        next();
    }
}

module.exports= isAdminLoggedin;