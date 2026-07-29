const mongoose= require('mongoose');
const notification = require('./notification');

const userSchema = mongoose.Schema({
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
    applications:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"application"
    }],
    notifications:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"notification"
    }]

})

module.exports = mongoose.model("user",userSchema);