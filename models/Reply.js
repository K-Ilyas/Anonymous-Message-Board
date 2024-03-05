module.exports = async function (client) {
    const reply = new client.Schema({
        text: { type: String },
        delete_password: { type: String },
        reported: { type: Boolean, default: false },
        created_at: { type: Date, required: true, default: Date.now },
    });
    return client.model("Reply", reply);
}