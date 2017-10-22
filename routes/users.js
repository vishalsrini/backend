var express   = require('express');
var router    = express.Router();
var passport  = require('passport');
var User      = require('../models/user');
var Verify    = require('./verify');
var email 	= require("emailjs");

var server 	= email.server.connect({
   user:    "vishalvishal619@gmail.com", 
   password:"Rama17Aug", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdminUser, function(req, res, next) {
  User.find({}, function(err, resp){
    if(err) throw err;
    res.status(200).json(resp);
  })
});

/** 
 * Get a particular user
 */
router.get('/currentUser', Verify.verifyOrdinaryUser, function(req, res, next) {
 console.log('current user', req.decoded._doc._id);
  User.findById(req.decoded._doc._id, function(err, user) {
    if(err) throw err;
    console.log(user.username);
    res.status(200).json(user);
  })
});


/**
 * Registration of user service
 */
router.post('/register', function(req, res){
  /** User.register currently there on passportLocalMongoose implemented in USER model 
   *  parameters (username, password, callback function) Username mush come from a model (object)
  */
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err) {
      return res.status(500).json({err: err});
    }

    if(req.body.name) {
      user.name = req.body.name;
      // user.image = '/images/profiles/'+req.body.name.charAt(0)+'.png'
    } else {
      return res.status(500).json({message: 'Please Enter your name and continue'});
    }

    if(req.body.image) {
      // user.image = req.body.image;
      user.image = '/assets/img/logo.png'
      // user.image = '/images/profiles/'+req.body.name.charAt(0)+'.png'
    } else {
      user.image = '/assets/img/logo.png'
    }

    if(req.body.phone) {
      user.phone = req.body.phone;
    } else {
      return res.status(500).json({message: 'Please Enter your phone and continue'});
    }

    if(req.body.about) {
      user.about = req.body.about;
    } else {
      return res.status(500).json({message: 'Please Enter Something about yourself and continue'});
    }

    if(req.body.companyName) {
      user.companyName = req.body.companyName;
    } else {
      return res.status(500).json({message: 'Please Enter your company name and continue'});
    }

    if(req.body.companyType) {
      user.companyType = req.body.companyType;
    } else {
      return res.status(500).json({message: 'Please Enter your company type and continue'});
    }

    if(req.body.registrationNumber) {
      user.registrationNumber = req.body.registrationNumber;
    } else {
      return res.status(500).json({message: 'Please Enter your registration number and continue'});
    }

    if(req.body.addressLine1) {
      user.addressLine1 = req.body.addressLine1;
    } else {
      return res.status(500).json({message: 'Please Enter your address and continue'});
    }

    if(req.body.addressLine2) {
      user.addressLine2 = req.body.addressLine2;
    } 

    if(req.body.city) {
      user.city = req.body.city;
    } else {
      return res.status(500).json({message: 'Please Enter your city and continue'});
    }

    if(req.body.region) {
      user.region = req.body.region;
    } else {
      return res.status(500).json({message: 'Please Enter your region and continue'});
    }

    if(req.body.postalCode) {
      user.postalCode = req.body.postalCode;
    } else {
      return res.status(500).json({message: 'Please Enter your postalCode / Zipcode and continue'});
    }

    if(req.body.country) {
      user.country = req.body.country;
    } else {
      return res.status(500).json({message: 'Please Enter your country and continue'});
    }
    console.log(user);
    user.verified = false;

    user.save(function(err, resp){
      /** Authenticate yourself using passport. This is local authentication */
      passport.authenticate('local')(req, res, function(){
        // send the message and get a callback with an error or details of the message that was sent
        console.log("Response from server and request from server: ------------------------------------------------------------------------------------- " + req, res + "------------------------------------------------------------------------------------ end -----------------------");
        server.send({
          text:    "Hi, \n Please click the following link to activate your account http://app.apaarr.com/#/activate/" + req.user._id, 
          from:    "Vishal <vishalvishal619@gmail.com>", 
          to:      req.body.name + "<" + req.body.username +">",
          bcc:      "Vishal Srinivasan <vishalvishal619@gmail.com>",
          subject: "User Verification from APAARR PROCUREMENT SERVICES"
        }, function(err, message) { 
          console.log(err || message);
          return res.status(200).json({status: 'Registration Successful!'});  
        });
        
      });
    });
  });
});

/**
 * Login of user service
 */
router.post('/login', function(req, res, next){
  /**
   * User authentication done using passport
   */
  passport.authenticate('local', function(err, user, info){

    if(err) {
      return next(err);
    }

    if(!user) {
      return res.status(401).json({
        err: info
      });
    }

    req.logIn(user, function(err){          // Trying to login the user. Available inbuilt function in passport
      if(err) {
        return res.status(500).json({
          err: 'Could not login user'
        })
      }

      if(!user.verified) {
        return res.status(403).json({
          err: 'Please verify your authentication mail sent to the registered mailId and continue'
        })
      }
      console.log('User in Users', user);
      var token = Verify.getToken(user);    // Generating JSON Web Token (JWT) here

      res.status(200).json({
        status: 'Login Successful',
        success: true,
        token: token
      });
    })
  })(req, res, next);
});

/**
 * Activation a particular user by clicking on the refferal link
 */
router.post("/activate/:id", function(req, res, next) {
    /**
   * User authentication done using passport
   */
  passport.authenticate('local', function(err, user, info){

    if(err) {
      return next(err);
    }

    if(!user) {
      return res.status(401).json({
        err: info
      });
    }

    req.logIn(user, function(err){          // Trying to login the user. Available inbuilt function in passport
      if(err) {
        return res.status(500).json({
          err: 'Could not login user'
        })
      }

      User.findByIdAndUpdate(req.params.id, {'$set':{'verified': true}}, {new: true}, function(err, resp) {
        if(err) throw err;
        console.log("response ----- "+JSON.stringify(resp));

        server.send({
          text:    "Hi "+resp.name+", \n Your verification process is successfull. You can now login and get more informations.", 
          from:    "Vishal <vishalvishal619@gmail.com>", 
          to:      resp.name + "<" + resp.username +">",
          bcc:      "Vishal Srinivasan <vishalvishal619@gmail.com>",
          subject: "Verification successfull - APAARR PROCUREMENT SERVICES"
        }, function(err, message) { 
          if(err) throw err;
          res.status(200).json({
            status: 'Activation Successful',
            success: true
          });
        });
      } )
      
    })
  })(req, res, next);
})

/**
 * Updating a particular user
 */
router.post('/updateUser', Verify.verifyOrdinaryUser, function(req, res) {
  // if(req.body.has(username || password)) {
  //   res.status(403).json({
  //     status: 'Not Authorized',
  //     message: 'You are not allowed to do the specified action'
  //   })
  // }

  User.findByIdAndUpdate(req.decoded._doc._id, {'$set': req.body}, {new: true}, function(err, resp) {
    if(err) throw err;
    server.send({
          text:    "Hi "+req.body.name+", \n This is a security email stating there is a change in your profile. Please login to apaarr.com and revert changes if it is not done by you. If you did this then leave this mail.", 
          from:    "Vishal <vishalvishal619@gmail.com>", 
          to:      resp.name + "<" + resp.username +">",
          bcc:      "Vishal Srinivasan <vishalvishal619@gmail.com>",
          subject: "Profile update APAARR PROCUREMENT SERVICES"
        }, function(err, message) { 
          console.log(err || message);
          return res.status(200).json({
              status: 'success',
              message: 'Your changes are saved successfully'
            }) 
        });
    
  })

})

/**
 *  Adding another person as admin 
 */
router.post('/addAdmin', function(req, res) {
  if(req.body.username == 'vishal@apaarr.com' && req.body.password == 'Ramamani123$') {
    User.findByUsername(req.body.admin.username, function(err, user){
      if(err) throw err;
      if (req.body.admin.status == true) {
        user.admin = true;
      } else {
        user.admin = false;
      }
      user.save(function(err, resp) {
        res.status(200).json({
          status: 'success',
          message: 'Changed access'
        })
      })
    })
  } else {
    res.status(403).json({
      status: 'failure',
      message: 'You are not authorized'
    })
  }
});


/**
 * Logout part of users
 */
router.get('/logout', function(req, res){
  req.logout();
  res.status(200).json({
    message: 'Bye!!'
  });
});

module.exports = router;
