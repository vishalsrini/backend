var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var negotiation = require('../models/negotiations');
var verify = require('./verify');

var negotiationRouter = express.Router();

/** Using body parser to parse body */
negotiationRouter.use(bodyParser.json());

negotiationRouter.route('/')
//.all(verify.verifyOrdinaryUser)
/** Fetch all negotiations */
.get(verify.verifyOrdinaryUser, verify.verifyAdminUser, function(req, resp, next) {
    negotiation.find({postedBy : req.decoded._doc._id}, function(err, res) {
        if(err) throw err;
        resp.status(200).json(res);
    })
})
/** Post a negotiation */
.post(verify.verifyOrdinaryUser, function(req, resp, next) {
    req.body.postedBy = req.decoded._doc._id;
    negotiation.create(req.body, function(err, res) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'Created Successfully'
        })
    })
})
/** Deleting entire negotiations */
.delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function(req, resp, next) {
    negotiation.remove({}, function(err, res) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'Deleted Successfully'
        })
    })
});

/** LoggedIn users post alone can be got from this function */
var getLoggedInUserPost = function(req, res, callback) {
    var userPost = [];
    for( i=res.length-1; i >= 0; i-- ) {
        console.log(res[i].postedBy, req.decoded._doc._id);
        if(res[i].postedBy == req.decoded._doc._id) {
            userPost.push(res[i]);
        }
    }
    callback(null, userPost);
}

/** Fetching his/her negotiations alone */
negotiationRouter.route('/users')
//.all(verify.verifyOrdinaryUser)
/** Getting their negotiations */
.get(verify.verifyOrdinaryUser, function(req, resp, next) {
    // negotiation.find({}, function(err, res) {
    //     if(err) throw err;
    //     getLoggedInUserPost(req, res, function(err, userPost) {
    //         if(err) throw err;
    //         resp.status(200).json(userPost);
    //     })
    // })
    negotiation.find({postedBy : req.decoded._doc._id}, function(err, res) {
        if(err) throw err;
        resp.status(200).json(res);
    })
});

/** CRUD on one particular negotiation */
negotiationRouter.route('/:negotiateId')
//.all(verify.verifyOrdinaryUser)
/** Fetching a negotiation */
.get(verify.verifyOrdinaryUser, function(req, resp, next) {
    negotiation.findById(req.params.negotiateId, function(err, res) {
        if(err) throw err;
        resp.status(200).json(res);
    })
})
/** Updating a negotiation */
.put(verify.verifyOrdinaryUser, function(req, resp, next) {
    negotiation.findById(req.params.negotiateId, function(err, res) {
        if(err) throw err;
        if(req.body.hasOwnProperty('status')) {
            if (req.body.status == 'active') {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            }
        } else if(res.postedBy != req.decoded._doc._id) {
            var err = new Error('You are not authorized');
            err.status = 403;
            next(err);
        } else {
            negotiation.findByIdAndUpdate(req.params.negotiateId, {'$set': req.body}, {new: true}, function(err, res) {
                if(err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'Successfully Modified',
                    id: res._id
                })
            })
        }
    })
})
/** Deleting a negotiation */
.delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function(req, resp, next) {
    negotiation.findByIdAndRemove(req.params.negotiateId, function(err, res) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'Deleted Successfully'
        });
    });
});

module.exports = negotiationRouter;