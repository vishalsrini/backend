var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var rawCashew = require('../models/offers/raw');               // Raw Cashew Model
var processedCashew = require('../models/offers/processed');   // Processed Cashe Model
var verify = require('./verify');
var cors = require('cors');

var offersRouter = express.Router();

/** Using body parser for converting input to json */
offersRouter.use(bodyParser.json());

// -------------------------------------------- All Offers ------------------------------------
/** Fetching and deleting all offers */
offersRouter.route('/')
    /** Fetching offers */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        var offers = {
            raw: null,
            processed: null
        };
        rawCashew.find({}, function (err, res) {
            if (err) throw err;
            offers.raw = res;
            processedCashew.find({}, function (err, res) {
                if (err) throw err;
                offers.processed = res;
                resp.status(200).json(offers);
            });
        });
    })
    /** Deleting offers */
    .delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        rawCashew.remove({}, function (err, res) {
            if (err) throw err;
            processedCashew.remove({}, function (err, res) {
                if (err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'Deleted Successfully'
                })
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

/** Fetching particular users requirements */
offersRouter.route('/users')
    /** Fetching alone */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        console.log(req);
        var offers = {
            raw: null,
            processed: null
        };
        //     rawCashew.find({}, function(err, res) {
        //         if(err) throw err;
        //         getLoggedInUserPost(req, res, function(err, post) {
        //             if(err) throw err;
        //             offers.raw = post;
        //             processedCashew.find({}, function(err, res) {
        //                 if(err) throw err;
        //                 getLoggedInUserPost(req, res, function(err, post) {
        //                     if(err) throw err;
        //                     offers.processed = post;
        //                     resp.status(200).json(offers);
        //                 });
        //             });
        //         }); 
        //     });
        // });

        rawCashew.find({ postedBy: req.decoded._doc._id }, function (err, res) {
            if (err) throw err;
            offers.raw = res;
            processedCashew.find({ postedBy: req.decoded._doc._id }, function (err, res) {
                if (err) throw err;
                offers.processed = res;
                resp.status(200).json(offers);
            });
        });
    });

// -------------------------------------------- Raw Cashew Offers ------------------------------------
/** CRUD on all raw cashew offers */
offersRouter.route('/raw')
    /** Users need to be logged in */
    // .all(verify.verifyOrdinaryUser)
    /** Fetching offers */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        rawCashew.find({ status: "active" }, function (err, cashew) {
            if (err) throw err;
            resp.status(200).json(cashew);
        })
    })
    /** Posting offers */
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        req.body.postedBy = req.decoded._doc._id;
        rawCashew.create(req.body, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Created Successfully',
                id: res._id
            });
        });
    })
    /** Deleting offers */
    .delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        rawCashew.remove({}, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            })
        })
    });

/** CRUD on particular raw cashew offer */
offersRouter.route('/raw/:cashewId')
    // .all(verify.verifyOrdinaryUser)
    /** Fetching offer */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        rawCashew.findById(req.params.cashewId, function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    /** updating offer */
    .put(verify.verifyOrdinaryUser, function (req, resp, next) {
        console.log('came inside');
        rawCashew.findById(req.params.cashewId, function (err, cashew) {
            /** One cant delete other users post */
            if (req.body.hasOwnProperty('status')) {
                if (req.body.status == 'active') {
                    var err = new Error('You are not authorized');
                    err.status = 403;
                    next(err);
                }
            } else if (cashew.postedBy != req.decoded._doc._id) {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            } else {
                req.body.status = "inProgress";
                rawCashew.findByIdAndUpdate(req.params.cashewId, { '$set': req.body }, { new: true }, function (err, res) {
                    if (err) throw err;
                    resp.status(200).json({
                        status: 'success',
                        message: 'Updated Successfully',
                        id: res._id
                    })
                })
            }
        });
    })
    /** Deleting offer */
    .delete(verify.verifyOrdinaryUser, function (req, resp, next) {
        rawCashew.findById(req.params.cashewId, function (err, cashew) {
            /** One cant delete other users post */
            if (cashew.postedBy != req.decoded._doc._id) {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            } else {
                rawCashew.findByIdAndRemove(req.params.cashewId, function (err, res) {
                    if (err) throw err;
                    resp.status(200).json({
                        status: 'success',
                        message: 'Deleted Successfully'
                    })
                })
            }
        });
    });

// -------------------------------------------- Processed Cashew Offers ------------------------------------
offersRouter.route('/processed')
    // .all(verify.verifyOrdinaryUser)
    /** Fetch offers */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        processedCashew.find({ status: "active" }, function (err, cashew) {
            if (err) throw err;
            resp.status(200).json(cashew);
        })
    })
    /** Post offers */
    .post(verify.verifyOrdinaryUser, function (req, resp, next) {
        req.body.postedBy = req.decoded._doc._id;
        processedCashew.create(req.body, function (err, cashew) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Created Successfully',
                id: cashew._id
            });
        });
    })
    /** Delete Offers */
    .delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
        processedCashew.remove({}, function (err, res) {
            if (err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            })
        })
    });

/** Particular Cashew Id */
offersRouter.route('/processed/:cashewId')
    // .all(verify.verifyOrdinaryUser)
    /** Fetch all offers */
    .get(verify.verifyOrdinaryUser, function (req, resp, next) {
        processedCashew.findById(req.params.cashewId, function (err, res) {
            if (err) throw err;
            resp.status(200).json(res);
        })
    })
    /** Update an offer */
    .put(verify.verifyOrdinaryUser, function (req, resp, next) {
        // console.log('request body hei..', req.body, req.method);
        processedCashew.findById(req.params.cashewId, function (err, cashew) {
            // console.log(req.headers);
            // console.log(req.body);
            /** One cant delete other users post */
            if (req.body.hasOwnProperty('status')) {
                if (req.body.status == 'active') {
                    var err = new Error('You are not authorized');
                    err.status = 403;
                    next(err);
                }
            } else if (cashew.postedBy != req.decoded._doc._id) {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            } else {
                req.body.status = "inProgress";
                processedCashew.findByIdAndUpdate(req.params.cashewId, { '$set': req.body }, { new: true }, function (err, res) {
                    if (err) throw err;
                    console.log(res);
                    resp.status(200).json({
                        status: 'success',
                        message: 'Updated Successfully',
                        id: res._id
                    });
                });
            }
        });
        // processedCashew.findByIdAndUpdate(req.params.cashewId, {'$set':req.body}, {new: true}, function(err, res) {
        //     if(err) throw err;
        //     console.log(res);
        //     resp.status(200).json({
        //         status: 'success',
        //         message: 'Updated Successfully',
        //         id: res._id
        //     });
        // });
    })
    /** Delete an offer */
    .delete(verify.verifyOrdinaryUser, function (req, resp, next) {
        processedCashew.findById(req.params.cashewId, function (err, cashew) {
            /** One cant delete other users post */
            if (cashew.postedBy != req.decoded._doc._id) {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            } else {
                processedCashew.findByIdAndRemove(req.params.cashewId, function (err, res) {
                    if (err) throw err;
                    resp.status(200).json({
                        status: 'success',
                        message: 'Deleted Successfully'
                    })
                })
            }
        });
    });

module.exports = offersRouter;
