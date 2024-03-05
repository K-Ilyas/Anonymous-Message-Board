module.exports = async function (client) {
    const board = new client.Schema({
        name: {type : String},
        threads: [{ type: client.Schema.Types.ObjectId, ref: 'Thread' }]
    });
    return client.model("Board", board);
}