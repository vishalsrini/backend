var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var processedOfferNegotiationsSchema = new Schema({
    // type: String,       // Raw / Processed
    // from: String,       // offers / requirements
    negotiatedItemId: {
        // unique: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'processedcashewoffer'
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

processedOfferNegotiationsSchema.index({ negotiatedItemId: 1, negotiatedBy: 1}, { unique: true, sparse: true });
module.exports = mongoose.model('processedoffernegotiations', processedOfferNegotiationsSchema);