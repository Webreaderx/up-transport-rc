const mongoose= require('mongoose');

const adminSchema = mongoose.Schema({
    profilepic:{
        data:Buffer,
        contentType:String
    },
    fullname:String,
    username:String,
    email:String,
    password:String,
    dob:String,
    mob:Number,
    active:Boolean,
    super:Boolean

})

module.exports = mongoose.model("admin",adminSchema);