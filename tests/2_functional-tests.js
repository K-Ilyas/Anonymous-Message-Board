const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);


let thread_id;
let reply_id;

suite('Functional Tests', function () {
    test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
        chai
            .request(server)
            .post("/api/threads/general")
            .set("content-type", "application/json")
            .send({ text: "this is a new thread", delete_password: "ok" })
            .end(function (error, response) {

                assert.equal(response.status, "200", "the response status must be 200");
                assert.property(response.body, "_id", "the response must include the _id property");
                assert.property(response.body, "text", "the response must include the text property");
                assert.property(response.body, "delete_password", "the response must include the delete_password property");
                assert.property(response.body, "replies", "the response must include the replies property");
                assert.property(response.body, "created_at", "the response must include the created_at property");
                assert.property(response.body, "reported", "the response must include the reported property");

                assert.property(response.body, "bumped_on", "the response must include the bumped_on property");

                assert.equal(response.body.text, "this is a new thread");
                assert.equal(response.body.delete_password, "ok");
                assert.equal(response.body.reported, false);

                thread_id = response.body._id;
                done();
            })
    });


    test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
        chai
            .request(server)
            .post("/api/replies/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, text: "This is a new reply", delete_password: "ok" })
            .end(function (error, response) {

                assert.equal(response.status, "200", "the response status must be 200");
                assert.property(response.body, "_id", "the response must include the _id property");
                assert.property(response.body, "text", "the response must include the text property");
                assert.property(response.body, "delete_password", "the response must include the delete_password property");
                assert.property(response.body, "created_at", "the response must include the created_at property");
                assert.property(response.body, "reported", "the response must include the reported property");
                assert.equal(response.body.text, "This is a new reply");
                assert.equal(response.body.delete_password, "ok");
                assert.equal(response.body.reported, false);
                reply_id = response.body._id;
                done();
            })
    });



    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
        chai
            .request(server)
            .get(`/api/replies/general?thread_id=${thread_id}`)
            .set("content-type", "application/json")
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.property(response.body, "_id", "the response must include the _id property");
                assert.property(response.body, "text", "the response must include the text property");
                assert.property(response.body, "replies", "the response must include the replies property");
                assert.property(response.body, "created_at", "the response must include the created_at property");
                assert.property(response.body, "bumped_on", "the response must include the bumped_on property");

                if (response.body.replies.length > 0) {
                    assert.property(response.body.replies[0], "_id", "the response must include the _id property");
                    assert.property(response.body.replies[0], "text", "the response must include the text property");
                    assert.property(response.body.replies[0], "created_at", "the response must include the created_at property");
                }


                done();
            })
    });


    test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
        chai
            .request(server)
            .put("/api/replies/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, reply_id: reply_id })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "reported", "The message must be reported");
                done();
            })
    });



    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
        chai
            .request(server)
            .delete("/api/replies/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, reply_id: reply_id, delete_password: "none" })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "incorrect password", "The message must be incorrect password");
                done();
            })
    });


    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
        chai
            .request(server)
            .delete("/api/replies/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, reply_id: reply_id, delete_password: "ok" })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "success", "The message must be success");
                done();
            })
    });

    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
        chai
            .request(server)
            .get("/api/threads/general")
            .set("content-type", "application/json")
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.isArray(response.body, "The response should be an array of threads");
                assert.property(response.body[0], "_id", "the response must include the _id property");
                assert.property(response.body[0], "text", "the response must include the text property");
                assert.property(response.body[0], "replies", "the response must include the replies property");
                assert.property(response.body[0], "created_at", "the response must include the created_at property");
                assert.property(response.body[0], "bumped_on", "the response must include the bumped_on property");
                assert.approximately(response.body[0].replies.length, 0, 3);
                done();
            })
    });



    test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
        chai
            .request(server)
            .put("/api/threads/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "reported", "The message must be reported");
                done();
            })
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
        chai
            .request(server)
            .delete("/api/threads/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, delete_password: "none" })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "incorrect password", "The message must be incorrect password");
                done();
            })
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
        chai
            .request(server)
            .delete("/api/threads/general")
            .set("content-type", "application/json")
            .send({ thread_id: thread_id, delete_password: "ok" })
            .end(function (error, response) {
                assert.equal(response.status, "200", "the response status must be 200");
                assert.equal(response.text, "success", "The message must be success");
                done();
            })
    });



});
