var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

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
    .get(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, resp, next) {
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
        rawCashew.find({}, function (err, res) {
            if (err) throw err;
            response.offers.raw = res;
            processedCashew.find({}, function (err, res) {
                if (err) throw err;
                response.offers.processed = res;
                rawCashewReq.find({}, function (err, res) {
                    if (err) throw err;
                    response.req.raw = res;
                    processedCashewReq.find({}, function (err, res) {
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