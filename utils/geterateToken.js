const jwt = require('jsonwebtoken');

generateToken=(user)=>{
    let token = jwt.sign({email:user.email,userid:user._id},process.env.SECURITY_KEY);
    return token;
}

module.exports=generateToken;