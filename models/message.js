const mongoose= require('mongoose');

const messageSchema = mongoose.Schema({
    flag:Boolean

})

module.exports = mongoose.model("message",messageSchema);