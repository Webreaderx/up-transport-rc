const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    aplId: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
        },
    vhType: String,
    manufacturer: String,
    vhModel: String,
    vhNum: String,
    hp: String,
    ono: Number,
    add: String,
    fuel: String,
    rto: String,
    vhImg: {
        data: Buffer,
        contentType: String
        },
    status: String,
    appliedDate: {
        type: Date,
        default: Date.now
        },
    approveDate:Date


})

module.exports = mongoose.model("application", applicationSchema);