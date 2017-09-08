var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rawCashewReqSchema = new Schema({
    year: Number,
    origin: String,
    quantity: Number,
    price: Number,
    outTurn: Number,
    nutCount: Number,
    defective: Number,
    moisture: Number,
    others: Number,
    packing: String,
    loading: String,
    inspection: String,
    landingPort: String,
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
},{
    timestamps: true
});

module.exports = mongoose.model('rawcashewreq', rawCashewReqSchema);