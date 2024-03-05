const mongoose = require("mongoose");
const Thread = require("./models/Thread");
const Reply = require("./models/Reply");
const Board = require("./models/Board");

require("dotenv").config();


async function main(callback) {
    // const URI = process.env.MONGO_URI;
    const URI = process.env.DB;
    try {
        // await client.connect();
        // Make the appropriate DB calls
        const mongooseClinet = await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const BoardModel = await Board(mongooseClinet);

        const ThreadModel = await Thread(mongooseClinet);
        const ReplyModel = await Reply(mongooseClinet);

        await callback(mongooseClinet, BoardModel, ThreadModel, ReplyModel);
        console.log("Connect to the Database");
    }
    catch (e) {
        //cathc any errors
        console.log(e);
        throw new Error("Unable to Connect to the Database");
    }
}

module.exports = main;