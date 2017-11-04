var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rawOfferNegotiationsSchema = new Schema({
    // type: String,       // Raw / Processed
    // from: String,       // offers / requirements
    negotiatedItemId: {
        // unique: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rawcashewoffer'
    },
    status: {           // active / closed
        type: String,  
        default: 'pending'
    },
    negotiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

rawOfferNegotiationsSchema.index({ negotiatedItemId: 1, negotiatedBy: 1}, { unique: true, sparse: true });
module.exports = mongoose.model('rawOfferNegotiations', rawOfferNegotiationsSchema);