var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// var negotiation = require('../models/negotiations');
var rawOffNeg = require('../models/negotiations/offers/raw');
var processedOffNeg = require('../models/negotiations/offers/processed');
var rawReqNeg = require('../models/negotiations/requirements/raw');
var processedReqNeg = require('../models/negotiations/requirements/processed');
var User = require('../models/user');

var verify = require('./verify');


var rawCashewReq = require('../models/requirements/raw');               // Raw Cashew Model
var processedCashewReq = require('../models/requirements/processed');   // Processed Cashe Model

var rawCashewOff = require('../models/offers/raw');               // Raw Cashew Model
var processedCashewOff = require('../models/offers/processed');   // Processed Cashe Model

var negotiationRouter = express.Router();
var email = require("emailjs");

var server = email.server.connect({
    user: "vishalvishal619@gmail.com",
    password: "Rama1768",
    host: "smtp.gmail.com",
    ssl: true
});

/** Using body parser to parse body */
negotiationRouter.use(bodyParser.json());

negotiationRouter.route('/')
    //.all(verify.verifyOrdinaryUser)
    /** Fetch all negotiations */
    .get(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        var negotiations = {
            offers: {
                raw: [],
                processed: []
            },
            requirements: {
                raw: [],
                processed: []
            }
        };
        rawOffNeg.find({ negotiatedBy: req.decoded._doc._id }).populate('negotiatedItemId').exec(function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
        negotiation.find({ postedBy: req.decoded._doc._id }, function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    /** Post a negotiation */
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        req.body.postedBy = req.decoded._doc._id;
        negotiation.create(req.body, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Negotiation is successfull!! Please check your mailbox. Will contact you soon.'
            })
        })
    })
    /** Deleting entire negotiations */
    .delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        negotiation.remove({}, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            })
        })
    });

/** LoggedIn users post alone can be got from this function */
var getLoggedInUserPost = function (req, res, callback) {
    var userPost = [];
    for (i = res.length - 1; i >= 0; i--) {
        console.log(res[i].postedBy, req.decoded._doc._id);
        if (res[i].postedBy == req.decoded._doc._id) {
            userPost.push(res[i]);
        }
    }
    callback(null, userPost);
}

/** Fetching his/her negotiations alone */
negotiationRouter.route('/users')
    //.all(verify.verifyOrdinaryUser)
    /** Getting their negotiations */
    .get(verify.verifyOrdinaryUser, function (req, respn, next) {
        // negotiation.find({}, function(err, res) {
        //     if(err) throw err;
        //     getLoggedInUserPost(req, res, function(err, userPost) {
        //         if(err) throw err;
        //         resp.status(200).json(userPost);
        //     })
        // })
        negotiation.find({ postedBy: req.decoded._doc._id }, function (err, res) {
            if (err) throw err;
            respn.status(200).json(res);
        })
    });

// =============================================================================================================== //

/**
 * Raw Cashew Offer
 */
negotiationRouter.route('/offer/raw')
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        rawOffNeg.find({ negotiatedBy: req.decoded._doc._id }).populate('negotiatedItemId').exec(function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        // if (rawOffNeg.find({ negotiatedItemId: req.body.negotiatedItemId }).limit(1).size() < 1) {
        req.body.negotiatedBy = req.decoded._doc._id;
        const item = {
            negotiatedBy: req.body.negotiatedBy,
            negotiatedItemId: req.body.negotiatedItemId
        }
        rawOffNeg.create(item, function (err, res) {
            if (err) {
                resp.status(200).json({
                    status: 'failed',
                    message: 'Item already negotiated, Please check negotiate tab'
                })
            } else {
                User.findById(req.decoded._doc._id, function (err, resps) {
                    if (err) {
                        return resp.status(401).json({ status: 'This user does not exist' });
                    }
                    server.send({
                        text: "Hi " + resps.name + ", \n Your Negotiation for the following item is sent for approval. \n \n Origin - " + req.body.origin + "\n Price (/MT)- " + req.body.currency + " " + req.body.price + " \n Nut Count - " + req.body.nutCount + "\n Year of Crop - " + req.body.year + "\n Quantity (MT) - " + req.body.quantity + "\n Payment Terms - " + req.body.paymentTerms + "\n Out Turn (lbs) - " + req.body.outTurn
                            + " \n \n You will receive a mail or call regarding the status of your negotiation. You can also find the status by clicking negotiate tab in app.apaarr.com \n \n Regards, \n Apaarr Procurement Services",
                        from: "Vishal <vishalvishal619@gmail.com>",
                        to: resps.name + "<" + resps.username + ">",
                        bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                        subject: "Negotiation Status from APAARR PROCUREMENT SERVICES"
                    }, function (err, message) {
                        console.log(err || message);
                        if (err) throw err;
                        return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                    });

                    // resp.status(200).json({
                    //     status: 'success',
                    //     message: 'Successfully Negotiated'
                    // })
                });
            }
        })
        // } else {
        //     resp.status(200).json({
        //         status: 'failed',
        //         message: 'Item already negotiated'
        //     })
        // }
    })


/**
 * Processed Cashew Offer
 */
negotiationRouter.route('/offer/processed')
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        processedOffNeg.find({ negotiatedBy: req.decoded._doc._id }).populate('negotiatedItemId').exec(function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {

        // if (processedOffNeg.find({ negotiatedItemId: req.body.negotiatedItemId }).limit(1).size() < 1) {
        req.body.negotiatedBy = req.decoded._doc._id;
        const item = {
            negotiatedBy: req.body.negotiatedBy,
            negotiatedItemId: req.body.negotiatedItemId
        }
        processedOffNeg.create(item, function (err, res) {
            if (err) {
                resp.status(200).json({
                    status: 'failed',
                    message: 'Item already negotiated, Please check negotiate tab'
                })
            } else {
                User.findById(req.decoded._doc._id, function (err, resps) {
                    if (err) {
                        return resp.status(401).json({ status: 'This user does not exist' });
                    }
                    server.send({
                        text: "Hi " + resps.name + ", \n Your Negotiation for the following item is sent for approval. \n \n Origin - " + req.body.origin + "\n Processed At - " + req.body.processedAt +"\n Price (/Kgs)- " + req.body.currency + " " + req.body.price + " \n Type - " + req.body.type + "\n Grade - " + req.body.grade + "\n Quantity (MT) - " + req.body.quantity + "\n Payment Terms - " + req.body.paymentTerms
                            + " \n \n You will receive a mail or call regarding the status of your negotiation. You can also find the status by clicking negotiate tab in app.apaarr.com \n \n Regards, \n Apaarr Procurement Services",
                        from: "Vishal <vishalvishal619@gmail.com>",
                        to: resps.name + "<" + resps.username + ">",
                        bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                        subject: "Negotiation Status from APAARR PROCUREMENT SERVICES"
                    }, function (err, message) {
                        console.log(err || message);
                        if (err) throw err;
                        return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                    });

                    // resp.status(200).json({
                    //     status: 'success',
                    //     message: 'Successfully Negotiated'
                    // })
                });
            }

        })
    })


/**
 * Raw Cashew Requirement
 */
negotiationRouter.route('/req/raw')
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        rawReqNeg.find({ negotiatedBy: req.decoded._doc._id }).populate('negotiatedItemId').exec(function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        // var count = rawReqNeg.find({negotiatedItemId: req.body.negotiatedItemId}).limit(1).size();
        // console.log(count);
        // if(count<1) {
        req.body.negotiatedBy = req.decoded._doc._id;
        const item = {
            negotiatedBy: req.body.negotiatedBy,
            negotiatedItemId: req.body.negotiatedItemId
        }
        rawReqNeg.create(item, function (err, res) {
            if (err) {
                resp.status(200).json({
                    status: 'failed',
                    message: 'Item already negotiated, Please check negotiate tab'
                })
            } else {
                User.findById(req.decoded._doc._id, function (err, resps) {
                    if (err) {
                        return resp.status(401).json({ status: 'This user does not exist' });
                    }
                    server.send({
                        text: "Hi " + resps.name + ", \n Your Negotiation for the following item is sent for approval. \n \n Origin - " + req.body.origin + "\n Price (/MT)- " + req.body.currency + " " + req.body.price + " \n Nut Count - " + req.body.nutCount + "\n Year of Crop - " + req.body.year + "\n Quantity (MT) - " + req.body.quantity + "\n Payment Terms - " + req.body.paymentTerms + "\n Out Turn (lbs) - " + req.body.outTurn
                            + " \n \n You will receive a mail or call regarding the status of your negotiation. You can also find the status by clicking negotiate tab in app.apaarr.com \n \n Regards, \n Apaarr Procurement Services",
                        from: "Vishal <vishalvishal619@gmail.com>",
                        to: resps.name + "<" + resps.username + ">",
                        bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                        subject: "Negotiation Status from APAARR PROCUREMENT SERVICES"
                    }, function (err, message) {
                        console.log(err || message);
                        if (err) throw err;
                        return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                    });

                    // resp.status(200).json({
                    //     status: 'success',
                    //     message: 'Successfully Negotiated'
                    // })
                });
            }
        })
        // } else {

        // }
    })


/**
 * Processed Cashew Requirement
 */
negotiationRouter.route('/req/processed')
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        processedReqNeg.find({ negotiatedBy: req.decoded._doc._id }).populate('negotiatedItemId').exec(function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        // if (processedReqNeg.find({ negotiatedItemId: req.body.negotiatedItemId }).limit(1).size() < 1) {
        req.body.negotiatedBy = req.decoded._doc._id;
        const item = {
            negotiatedBy: req.body.negotiatedBy,
            negotiatedItemId: req.body.negotiatedItemId
        }
        processedReqNeg.create(req.body, function (err, res) {
            if (err) {
                resp.status(200).json({
                    status: 'failed',
                    message: 'Item already negotiated, Please check negotiate tab'
                })
            } else {
                User.findById(req.decoded._doc._id, function (err, resps) {
                    if (err) {
                        return resp.status(401).json({ status: 'This user does not exist' });
                    }
                    server.send({
                        text: "Hi " + resps.name + ", \n Your Negotiation for the following item is sent for approval. \n \n Origin - " + req.body.origin + "\n Processed At - " + req.body.processedAt +"\n Price (/Kgs)- " + req.body.currency + " " + req.body.price + " \n Type - " + req.body.type + "\n Grade - " + req.body.grade + "\n Quantity (MT) - " + req.body.quantity + "\n Payment Terms - " + req.body.paymentTerms
                            + " \n \n You will receive a mail or call regarding the status of your negotiation. You can also find the status by clicking negotiate tab in app.apaarr.com \n \n Regards, \n Apaarr Procurement Services",
                        from: "Vishal <vishalvishal619@gmail.com>",
                        to: resps.name + "<" + resps.username + ">",
                        bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                        subject: "Negotiation Status from APAARR PROCUREMENT SERVICES"
                    }, function (err, message) {
                        console.log(err || message);
                        if (err) throw err;
                        return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                    });

                    // resp.status(200).json({
                    //     status: 'success',
                    //     message: 'Successfully Negotiated'
                    // })
                });
            }
        })
        // } else {
        //     resp.status(200).json({
        //         status: 'failed',
        //         message: 'Item already negotiated'
        //     })
        // }
    })
/** CRUD on one particular negotiation */
negotiationRouter.route('/:negotiateId')
    //.all(verify.verifyOrdinaryUser)
    /** Fetching a negotiation */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        negotiation.findById(req.params.negotiateId, function (err, res) {
            if (err) throw err;

            resp.status(200).json(res);
        })
    })
    /** Updating a negotiation */
    .put(verify.verifyOrdinaryUser, function (req, resp, next) {
        negotiation.findById(req.params.negotiateId, function (err, res) {
            if (err) throw err;
            if (req.body.hasOwnProperty('status')) {
                if (req.body.status == 'active') {
                    var err = new Error('You are not authorized');
                    err.status = 403;
                    next(err);
                }
            } else if (res.postedBy != req.decoded._doc._id) {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            } else {
                negotiation.findByIdAndUpdate(req.params.negotiateId, { '$set': req.body }, { new: true }, function (err, res) {
                    if (err) throw err;
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
    .delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        negotiation.findByIdAndRemove(req.params.negotiateId, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            });
        });
    });

module.exports = negotiationRouter;