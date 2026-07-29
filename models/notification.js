const mongoose= require('mongoose');

const notificationSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    titel:String,
    content:String,
    status:Number,
    date:{
        type: Date,
        default: Date.now
        },

        //1    Approved
        //2    Rejected
        //3    submitted

})

module.exports = mongoose.model("notification",notificationSchema);