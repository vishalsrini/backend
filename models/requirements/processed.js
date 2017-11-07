var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var processedCashewReqSchema = new Schema({
    origin: String,
    processedAt: String,
    quantity: Number,
    price: Number,
    currency: String,
    type: String,
    grade: String, 
    defective: Number,
    moisture: Number,
    quality: String,
    nslg: Number,
    packing: String,
    inspection: String,
    location: String,
    shipment: String,
    fob: {
        type: Boolean,
        default: false
    },
    cif: {
        type: Boolean,
        default: false    
    },
    paymentTerms: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'inProgress'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('processedcashewreq', processedCashewReqSchema);