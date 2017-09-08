var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var negotiationsSchema = new Schema({
    type: String,       // Raw / Processed
    from: String,       // offers / requirements
    negotiateId: {
        type: String
    },
    status: {           // active / closed
        type: String,  
        default: 'pending'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('negotiation', negotiationsSchema);