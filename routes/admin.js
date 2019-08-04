var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');

var rawCashew = require('../models/offers/raw');               // Raw Cashew Model
var processedCashew = require('../models/offers/processed');   // Processed Cashe Model
var rawCashewReq = require('../models/requirements/raw');               // Raw Cashew Model
var processedCashewReq = require('../models/requirements/processed');   // Processed Cashew Model

var verify = require('./verify');
var cors = require('cors');
var _ = require('lodash');

var adminRouter = express.Router();

/** Using body parser for converting input to json */
adminRouter.use(bodyParser.json());

// -------------------------------------------- All Offers ------------------------------------
/** Fetching and deleting all offers */
adminRouter.route('/')
    .get( function (req, resp, next) {
        var response = {
            req: {
                raw: null,
                processed: null
            },
            offers: {
                raw: null,
                processed: null
            }
        };
        rawCashew.find({}).populate('postedBy').exec(function (err, res) {
            if (err) throw err;
            response.offers.raw = res;
            processedCashew.find({}).populate('postedBy').exec(function (err, res) {
                if (err) throw err;
                response.offers.processed = res;
                rawCashewReq.find({}).populate('postedBy').exec(function (err, res) {
                    if (err) throw err;
                    response.req.raw = res;
                    processedCashewReq.find({}).populate('postedBy').exec(function (err, res) {
                        if (err) throw err;
                        response.req.processed = res;
                        resp.status(200).json(response);
                    });
                });
            });
        });
    });

adminRouter.route('/req/raw')
    .post(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
        let id = 0;
        _.forEach(req.body, (value) => {
            rawCashewReq.findByIdAndUpdate(value.id, { '$set': { status: value.status } }, { new: true }, function (err, resp) {
                if (err) throw err;
                // server.send({
                //     text: "Hi " + value.name + ", <br> Your Raw Cashew Requirement posted has been " + value.status + ".  <br>  <br> Message: " + value.message + " <br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services",
                //     from: "Vishal <vishalvishal619@gmail.com>",
                //     to: value.name + "<" + value.username + ">",
                //     bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                //     subject: "Reg your Requirement posted at APAARR PROCUREMENT SERVICES"
                // }, function (err, message) {
                //     console.log(err || message);
                //     if (err) {
                //         resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                //     };
                //     // return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                // });
                let formData = {
                    to: value.username,
                    subject: "Regarding your Requirement posted at APAARR PROCUREMENT SERVICES",
                    message: "Hi " + value.name + ", <br> Your Raw Cashew Offer posted has been " + value.status + ".  <br>  <br> Message: " + value.message + " <br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services"
                  }
              
                  request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
                    console.log(err || message);
                    if (err) resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                });
                ++id;
                if (id == req.body.length) {
                    res.status(200).json({
                        status: 'success',
                        message: 'updated successfully'
                    });
                }
            });
        });
    });

adminRouter.route('/req/processed')
    .post(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
        let id = 0;
        _.forEach(req.body, (value) => {
            processedCashewReq.findByIdAndUpdate(value.id, { '$set': { status: value.status } }, { new: true }, function (err, resp) {
                if (err) throw err;
                // server.send({
                //     text: "Hi " + value.name + ", <br> Your Processed Cashew Requirement posted has been " + value.status + ".  <br>  <br> Message: " + value.message + "<br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services",
                //     from: "Vishal <vishalvishal619@gmail.com>",
                //     to: value.name + "<" + value.username + ">",
                //     bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                //     subject: "Reg your Requirement posted at APAARR PROCUREMENT SERVICES"
                // }, function (err, message) {
                //     console.log(err || message);
                //     if (err) {
                //         resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                //     };
                //     // return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                // });
                let formData = {
                    to: value.username,
                    subject: "Regarding your Requirement posted at APAARR PROCUREMENT SERVICES",
                    message: "Hi " + value.name + ", <br> Your Processed Cashew Requirement posted has been " + value.status + ".  <br>  <br> Message: " + value.message + "<br> <br> For More Details log on to https://app.apaarr.com <br><br> Regards, <br> Apaarr Procurement Services"
                  }
              
                  request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
                    console.log(err || message);
                    if (err) resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                });
                ++id;
                if (id == req.body.length) {
                    res.status(200).json({
                        status: 'success',
                        message: 'updated successfully'
                    });
                }
            });
        });
    });

adminRouter.route('/offers/raw')
    .post(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
        let id = 0;
        _.forEach(req.body, (value) => {
            rawCashew.findByIdAndUpdate(value.id, { '$set': { status: value.status } }, { new: true }, function (err, resp) {
                if (err) throw err;
                // server.send({
                //     text: "Hi " + value.name + ", <br> Your Raw Cashew Offer posted has been " + value.status + ".  <br>  <br> Message: " + value.message + " <br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services",
                //     from: "Vishal <vishalvishal619@gmail.com>",
                //     to: value.name + "<" + value.username + ">",
                //     bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                //     subject: "Reg your Offer posted at APAARR PROCUREMENT SERVICES"
                // }, function (err, message) {
                //     console.log(err || message);
                //     if (err) {
                //         resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                //     };
                //     // return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                // });
                let formData = {
                    to: value.username,
                    subject: "Regarding your Offer posted at APAARR PROCUREMENT SERVICES",
                    message: "Hi " + value.name + ", <br> Your Raw Cashew Offer posted has been " + value.status + ".  <br>  <br> Message: " + value.message + " <br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services"
                  }
              
                  request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
                    console.log(err || message);
                    if (err) resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                });
                ++id;
                if (id == req.body.length) {
                    res.status(200).json({
                        status: 'success',
                        message: 'updated successfully'
                    });
                }
            });
        });
    });

adminRouter.route('/offers/processed')
    .post(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
        let id = 0;
        _.forEach(req.body, (value) => {
            processedCashew.findByIdAndUpdate(value.id, { '$set': { status: value.status } }, { new: true }, function (err, resp) {
                if (err) throw err;
                // server.send({
                //     text: "Hi " + value.name + ", <br> Your Processed Cashew Offer posted has been " + value.status + ".  <br>  <br> Message: " + value.message + "<br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services",
                //     from: "Vishal <vishalvishal619@gmail.com>",
                //     to: value.name + "<" + value.username + ">",
                //     bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
                //     subject: "Reg your Offer posted at APAARR PROCUREMENT SERVICES"
                // }, function (err, message) {
                //     console.log(err || message);
                //     if (err) {
                //         resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                //     };
                //     // return resp.status(200).json({ status: 'success', message: 'Successfully Negotiated' });
                // });
                let formData = {
                    to: value.username,
                    subject: "Regarding your Offer posted at APAARR PROCUREMENT SERVICES",
                    message: "Hi " + value.name + ", <br> Your Processed Cashew Offer posted has been " + value.status + ".  <br>  <br> Message: " + value.message + " <br> <br> For More Details log on to https://app.apaarr.com <br> <br> Regards, <br> Apaarr Procurement Services"
                  }
              
                  request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
                    console.log(err || message);
                    if (err) resp.status(200).json({ status: 'Something wrong', message: 'Something went wrong while sending mail' });
                });
                ++id;
                if (id == req.body.length) {
                    res.status(200).json({
                        status: 'success',
                        message: 'updated successfully'
                    });
                }
            });
        });
    });


module.exports = adminRouter;
