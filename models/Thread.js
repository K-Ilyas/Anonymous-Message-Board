
const mongoose = require("mongoose");
module.exports = async function (client) {


    const thread = new client.Schema({
        text: { type: String },
        delete_password: { type: String },
        reported: { type: Boolean, default: false },
        replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
        created_at: { type: Date, required: true, default: Date.now },
        bumped_on: { type: Date, required: true, default: Date.now }
    });
    return client.model("Thread", thread);

}