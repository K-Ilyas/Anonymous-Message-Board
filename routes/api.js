'use strict';

const mongoose = require("mongoose");
module.exports = function (app, clinet, BoardModel, ThreadModel, ReplyModel) {

  app.route('/api/threads/:board').post(async (req, res) => {

    const { text, delete_password } = req.body;

    if ((text != undefined && text != "") && (delete_password != undefined && delete_password != "") && req.params.board != undefined) {

      try {

        // find the model or create it, if it dosen't exist
        let borad = await BoardModel.findOne({ name: req.params.board });
        if (!borad) {
          borad = await BoardModel.create({ name: req.params.board, replies: [] });
        }

        // create a new thread and save it to the board 
        const newThread = await ThreadModel.create({ text: text, delete_password: delete_password });
        borad.threads.push(newThread);
        borad.save();

        // send the json response
        res.json(newThread);

      } catch (e) {
        res.json({ "error": `error ${e}` })
      }

    } else {
      res.json({ "error": "Something went wrong !!!" });
    }



  }).get(async (req, res) => {
    if (req.params.board != undefined) {
      const borad = await BoardModel.findOne({ name: req.params.board });

      borad.threads = await borad.threads.slice(borad.threads.length - 10);


      const threads = await ThreadModel.find({
        '_id': { $in: borad.threads }
      }).select({ 'replies': { '$slice': -3 } }).select('-delete_password -reported').populate('replies')
        .exec();



      if (!borad || !threads) {
        res.json({ "error": "Something went wrong !!!" });
      }
      else {
        res.json(threads);
      }
    } else {
      res.json({ "error": "Something went wrong !!!" });
    }

  });

  app.route('/api/replies/:board').post(async (req, res) => {
    const { text, delete_password, thread_id } = req.body;

    if ((text != undefined && text != "") && (delete_password != undefined && delete_password != "") && (thread_id != undefined && thread_id != "") && req.params.board != undefined) {

      try {
        // find the model or create it, if it dosen't exist
        let borad = await BoardModel.findOne({
          name: req.params.board, threads: new mongoose.Types.ObjectId(thread_id)
        });

        // cast the thread_id to ObjectId
        if (!borad) {
          res.json({ "error": "couldn't find the board!!!" });
        } else {
          // create a new reply and save it to the thread 
          const newReply = await ReplyModel.create({ text: text, delete_password: delete_password });

          if (newReply) {
            // update the thread bumped_date 
            await ThreadModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(thread_id) }, { bumped_on: newReply.created_at, $push: { replies: newReply } });
          }

          // send the json response
          res.json(newReply);
        }
      } catch (e) {
        res.json({ "error": `error ${e}` })
      }

    } else {
      res.json({ "error": "Something went wrong !!!" });
    }
  }).get(async (req, res) => {

    if (req.params.board != undefined && req.query.thread_id != undefined) {
      const borad = await BoardModel.findOne({ name: req.params.board, threads: new mongoose.Types.ObjectId(thread_id) });

      if (!borad) {
        res.json({ "error": "can't find the board or the thread!!!" });
      } else {

        const threads = await ThreadModel.find({
          '_id': { $in: borad.threads }
        }).select({ 'replies': { '$slice': -3 } }).select('-delete_password -reported').populate('replies')
          .exec();

        if (!borad || !threads) {
          res.json({ "error": "Something went wrong !!!" });
        }
        else {
          res.json(threads);
        }
      }
    } else {
      res.json({ "error": "Something went wrong !!!" });
    }
  });

};
