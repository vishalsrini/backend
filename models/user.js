var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var User = new Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: String,
    phone: String,
    name: String,
    companyName: String,
    companyType: String,
    registrationNumber: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    region: String,
    postalCode: String,
    country: String,
    admin: {
        type: Boolean,
        default: false    
    },
    image: String,
    verified: Boolean,
    about: String   
}, {
    timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);