var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var rawCashewReq = require('../models/requirements/raw');               // Raw Cashew Model
var processedCashewReq = require('../models/requirements/processed');   // Processed Cashe Model
var verify = require('./verify');

var requirementsRouter = express.Router();

/** Using body parser to parse body */
requirementsRouter.use(bodyParser.json());

/** Fetching and deleting all requirements */
requirementsRouter.route('/')
/** Fetching all requirements. Both raw and processed. */
.get(verify.verifyOrdinaryUser, function(req, resp, next) {
    var requirement = {
       raw: null,
       processed: null
    };
    rawCashewReq.find({}, function(err, res) {
        if(err) throw err;
        requirement.raw = res;
        processedCashewReq.find({}, function(err, res) {
            if(err) throw err;
            requirement.processed = res;
            resp.status(200).json(requirement);
        });
    });
})
.delete(verify.verifyOrdinaryUser, verify.verifyAdminUser, function(req, resp, next) {
    rawCashewReq.remove({}, function(err, res) {
        if(err) throw err;
        processedCashewReq.remove({}, function(err, res) {
            if(err) throw err;
            resp.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            })
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

/** Fetching particular users requirements */
requirementsRouter.route('/users')
/** Verifying whether the user is already registered */
// .all(verify.verifyOrdinaryUser)
/** Fetching alone */
.get(verify.verifyOrdinaryUser,function(req, resp, next) {
   console.log(req);
   var requirement = {
       raw: null,
       processed: null
   }; 
    rawCashewReq.find({}, function(err, res) {
        if(err) throw err;
        getLoggedInUserPost(req, res, function(err, post) {
            if(err) throw err;
            requirement.raw = post;
            processedCashewReq.find({}, function(err, res) {
                if(err) throw err;
                getLoggedInUserPost(req, res, function(err, post) {
                    if(err) throw err;
                    requirement.processed = post;
                    resp.status(200).json(requirement);
                });
            });
        }); 
    });
});

/***************************** RAW CASHEW BEGINS *****************************************/

/** CRUD on Raw Cashew */
requirementsRouter.route('/raw')
/** Check whether he loggedin */
// .all(verify.verifyOrdinaryUser)
/** Get all raw cashew requirements in system */ 
.get(verify.verifyOrdinaryUser,function(req, resp, next ) {
    rawCashewReq.find({status: "active"}, function(err, cashew) {
        if(err) throw err;
        resp.status(200).json(cashew);
    });
})
/** Post a raw cashew requirement */
.post(verify.verifyOrdinaryUser,function(req, resp, next) {
    req.body.postedBy = req.decoded._doc._id;
    rawCashewReq.create(req.body, function(err, cashew) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'Requirement posted successfully',
            id: cashew._id
        });
    });

})
/** Delete all raw cashew requirements */
.delete(verify.verifyOrdinaryUser,verify.verifyAdminUser, function(req, resp, next) {
    rawCashewReq.remove({}, function(err, res) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'All Raw Cashew Requirements are deleted'
        });
    });
});

/** CRUD on one particular requirement */
requirementsRouter.route('/raw/:rawCashewId')
/** Checking whether he is an registered user */
// .all(verify.verifyOrdinaryUser)
/** Get that particular raw cashew */
.get(verify.verifyOrdinaryUser,function(req, resp, next) {
    rawCashewReq.findById(req.params.rawCashewId, function(err, cashew) {
        if(err) throw err;
        resp.status(200).json(cashew);
    })
})
/** update that particular raw cashew */
.put(verify.verifyOrdinaryUser,function(req, resp, next) {
    rawCashewReq.findById(req.params.rawCashewId, function(err, cashew) {
        /** One cant delete other users post */
        if(req.body.hasOwnProperty('status')) {
            if (req.body.status == 'active') {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            }
        } else if(cashew.postedBy != req.decoded._doc._id) {
            var err = new Error('You are not authorized');
            err.status = 403;
            next(err);
        } else {
            req.body.status = "inProgress";
            rawCashewReq.findByIdAndUpdate(req.params.rawCashewId, {'$set': req.body}, {new: true}, function(err, res) {
                if(err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'updated successfully',
                    id: res._id
                });
            });
        }
    })
    
})
/** Delete that particular raw cashew */
.delete(verify.verifyOrdinaryUser,function(req, resp, next) {
    rawCashewReq.findById(req.params.rawCashewId, function(err, cashew) {
        /** One cant delete other users post */
        if(cashew.postedBy != req.decoded._doc._id) {
            var err = new Error('You are not authorized');
            err.status = 403;
            next(err);
        } else {
            rawCashewReq.findByIdAndRemove(req.params.rawCashewId, function(err, res) {
                if(err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'deleted successfully'
                });
            })
        }
    });
});

/******************************* RAW CASHEW ENDS ******************************************/

/***************************** PROCESSED CASHEW BEGINS **********************************/
requirementsRouter.route('/processed')
// .all(verify.verifyOrdinaryUser)
/** Get all processed Cashews */
.get(verify.verifyOrdinaryUser,function(req, resp, next) {
    processedCashewReq.find({status: "active"}, function(err, cashew) {
        if(err) throw err;
        console.log(cashew);
        resp.status(200).json(cashew);
    })

})
/** Posting a processed cashew */
.post(verify.verifyOrdinaryUser,function(req, resp, next) {
    req.body.postedBy = req.decoded._doc._id;
    processedCashewReq.create(req.body, function(err, cashew) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'processed cashew added successfully',
            id: cashew._id
        })
    });
})
/** Deleting all processed cashews */
.delete(verify.verifyOrdinaryUser,verify.verifyAdminUser, function(req, resp, next) {
    processedCashewReq.remove({}, function(err, res) {
        if(err) throw err;
        resp.status(200).json({
            status: 'success',
            message: 'processed cashew deleted successfully'
        });
    });
});

requirementsRouter.route('/processed/:processedId')
// .all(verify.verifyOrdinaryUser)
/** Get a particular processed cashew */
.get(verify.verifyOrdinaryUser,function(req, resp, next) {
    processedCashewReq.findById(req.params.processedId, function(err, cashew) {
        if(err) throw err;
        resp.status(200).json(cashew);
    })
})
/** Updating a particular processed cashew */
.put(verify.verifyOrdinaryUser,function(req, resp, next) {
    processedCashewReq.findById(req.params.processedId, function(err, res) {
        if(req.body.hasOwnProperty('status')) {
            if (req.body.status == 'active') {
                var err = new Error('You are not authorized');
                err.status = 403;
                next(err);
            }
        } else if(res.postedBy != req.decoded._doc._id) {
            var err = new Error('You are Not authorized');
            err.status = 403;
            next(err);
        } else {
            req.body.status = "inProgress";
            processedCashewReq.findByIdAndUpdate(req.params.processedId, {'$set':req.body}, {new: true}, function(err, cashew) {
                if(err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'updated successfully',
                    updated: cashew
                })
            })
        }
    })   
})
/** Deleting a particular processed cashew */
.delete(verify.verifyOrdinaryUser,function(req, resp, next) {
    processedCashewReq.findById(req.params.processedId, function(err, res) {
        if(res.postedBy != req.decoded._doc._id) {
            var err = new Error('You are Not authorized');
            err.status = 403;
            next(err);
        } else {
            processedCashewReq.findByIdAndRemove(req.params.processedId, function(err, res) {
                if(err) throw err;
                resp.status(200).json({
                    status: 'success',
                    message: 'Deleted successfully'
                });
            });
        }
    })
});

/***************************** PROCESSED CASHEW ENDS **********************************/

module.exports = requirementsRouter;
