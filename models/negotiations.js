var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rawOfferNegotiationsSchema = new Schema({
    // type: String,       // Raw / Processed
    // from: String,       // offers / requirements
    negotiatedItemId: {
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

module.exports = mongoose.model('rawOfferNegotiationsSchema', rawOfferNegotiationsSchema);