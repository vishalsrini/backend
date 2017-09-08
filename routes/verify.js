var User = require('../models/user');
var jwt = require('jsonwebtoken');      // Create verify and view tokens using this
var config = require('../config.js');

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function(req, res, next) {

    // Checking where the token exists. There are 3 places where it can exist as shown bellow
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // Checking whether the token is filled with value
    if(token) {
        jwt.verify(token, config.secretKey, function(err, decoded){
            if(err) {
                var err = new Error('Token is not correct not authenticated');
                err.status = 401;
                next(err);
            } else {
                console.log('Token Exist');
                req.decoded = decoded;
                next();
            }
        })
    } else {

        // No token exist so exiting with error
        var err = new Error('You are not authenticated. Token not exist');
        err.status = 403;
        next(err);

    }

}

exports.verifyAdminUser = function(req, res, next) {
    if(req.decoded._doc.admin) {
        console.log('admin, So go');
        next();
    } else {
        var err = new Error('You are not authorized!!');
        err.status = 403;
        next(err);
    }
}

