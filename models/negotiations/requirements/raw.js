var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rawReqNegotiationsSchema = new Schema({
    // type: String,       // Raw / Processed
    // from: String,       // offers / requirements
    negotiatedItemId: {
        // unique: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rawcashewreq'
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

rawReqNegotiationsSchema.index({ negotiatedItemId: 1, negotiatedBy: 1}, { unique: true, sparse: true });
module.exports = mongoose.model('rawReqNegotiations', rawReqNegotiationsSchema);