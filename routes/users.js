var express = require('express');
var request = require('request');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');
var email = require("emailjs");
var urlCrypt = require('url-crypt')('~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');

var server = email.server.connect({
  user: "vishalvishal619@gmail.com",
  password: "Rama1768",
  host: "smtp.gmail.com",
  ssl: true
});

/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdminUser, function (req, res, next) {
  User.find({}, function (err, resp) {
    if (err) throw err;
    res.status(200).json(resp);
  })
});

/** 
 * Get a particular user
 */
router.get('/currentUser', Verify.verifyOrdinaryUser, function (req, res, next) {
  console.log('current user', req.decoded._doc._id);
  User.findById(req.decoded._doc._id, function (err, user) {
    if (err) throw err;
    console.log(user.username);
    res.status(200).json(user);
  })
});


/**
 * Registration of user service
 */
router.post('/register', function (req, res) {
  if (!req.body.name) {
    return res.status(500).json({ message: 'Please Enter your name and continue' });
  } else if (!req.body.phone) {
    return res.status(500).json({ message: 'Please Enter your phone and continue' });
  } else if (!req.body.companyName) {
    return res.status(500).json({ message: 'Please Enter your company name and continue' });
  } else if (!req.body.companyType) {
    return res.status(500).json({ message: 'Please Enter your company type and continue' });
  } else if (!req.body.about) {
    return res.status(500).json({ message: 'Please Enter Something about yourself and continue' });
  } else if (!req.body.addressLine1) {
    return res.status(500).json({ message: 'Please Enter your address and continue' });
  } else if (!req.body.city) {
    return res.status(500).json({ message: 'Please Enter your city and continue' });
  } else if (!req.body.username) {
    return res.status(500).json({ message: 'Please Enter your Email Id and continue' });
  } else if (!req.body.password) {
    return res.status(500).json({ message: 'Please Enter your preferred password and continue' });
  } else if (!req.body.registrationNumber) {
    return res.status(500).json({ message: 'Please Enter your registration number and continue' });
  } else if (!req.body.region) {
    return res.status(500).json({ message: 'Please Enter your region and continue' });
  } else if (!req.body.postalCode) {
    return res.status(500).json({ message: 'Please Enter your postal code and continue' });
  } else if (!req.body.country) {
    return res.status(500).json({ message: 'Please Enter your country and continue' });
  } else {
    /** User.register currently there on passportLocalMongoose implemented in USER model 
     *  parameters (username, password, callback function) Username mush come from a model (object)
     */
    User.register(new User({ username: req.body.username.trim().toLowerCase() }), req.body.password, function (err, user) {
      if (err) {
        return res.status(500).json({ err: err });
      }

      if (req.body.name) {
        user.name = req.body.name;
        // user.image = '/images/profiles/'+req.body.name.charAt(0)+'.png'
      } else {
        return res.status(500).json({ message: 'Please Enter your name and continue' });
      }

      if (req.body.image) {
        // user.image = req.body.image;
        user.image = '/assets/img/logo.png'
        // user.image = '/images/profiles/'+req.body.name.charAt(0)+'.png'
      } else {
        user.image = '/assets/img/logo.png'
      }

      if (req.body.phone) {
        user.phone = req.body.phone;
      } else {
        return res.status(500).json({ message: 'Please Enter your phone and continue' });
      }

      if (req.body.about) {
        user.about = req.body.about;
      } else {
        return res.status(500).json({ message: 'Please Enter Something about yourself and continue' });
      }

      if (req.body.companyName) {
        user.companyName = req.body.companyName;
      } else {
        return res.status(500).json({ message: 'Please Enter your company name and continue' });
      }

      if (req.body.companyType) {
        user.companyType = req.body.companyType;
      } else {
        return res.status(500).json({ message: 'Please Enter your company type and continue' });
      }

      if (req.body.registrationNumber) {
        user.registrationNumber = req.body.registrationNumber;
      } else {
        return res.status(500).json({ message: 'Please Enter your registration number and continue' });
      }

      if (req.body.addressLine1) {
        user.addressLine1 = req.body.addressLine1;
      } else {
        return res.status(500).json({ message: 'Please Enter your address and continue' });
      }

      if (req.body.addressLine2) {
        user.addressLine2 = req.body.addressLine2;
      }

      if (req.body.city) {
        user.city = req.body.city;
      } else {
        return res.status(500).json({ message: 'Please Enter your city and continue' });
      }

      if (req.body.region) {
        user.region = req.body.region;
      } else {
        return res.status(500).json({ message: 'Please Enter your region and continue' });
      }

      if (req.body.postalCode) {
        user.postalCode = req.body.postalCode;
      } else {
        return res.status(500).json({ message: 'Please Enter your postalCode / Zipcode and continue' });
      }

      if (req.body.country) {
        user.country = req.body.country;
      } else {
        return res.status(500).json({ message: 'Please Enter your country and continue' });
      }
      console.log(user);
      user.verified = false;

      user.save(function (err, resp) {
        /** Authenticate yourself using passport. This is local authentication */
        passport.authenticate('local')(req, res, function () {
          // send the message and get a callback with an error or details of the message that was sent
          // console.log("Response from server and request from server: ------------------------------------------------------------------------------------- " + req, res + "------------------------------------------------------------------------------------ end -----------------------");
          let formData = {
            to: req.body.username,
            subject: "User Verification from APAARR PROCUREMENT SERVICES",
            message: "Hi " + req.body.name + ", <br> Please click the following link to activate your account <br> <a href=\"http://app.apaarr.com/#/activate/" + urlCrypt.cryptObj(req.user._id) + "\">Click Here </a> <br><br> Regards, <br> Apaarr Procurement Services."
          }
          // server.send({
          //   text: "Hi " + req.body.name + ", \n Please click the following link to activate your account http://app.apaarr.com/#/activate/" + urlCrypt.cryptObj(req.user._id) + "\n Regards, \n Apaarr Procurement Services.",
          //   from: "Vishal <vishalvishal619@gmail.com>",
          //   to: req.body.name + "<" + req.body.username + ">",
          //   bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
          //   subject: "User Verification from APAARR PROCUREMENT SERVICES"
          // }, function (err, message) {
          //   console.log(err || message);
          //   if (err) throw err;
          //   return res.status(200).json({ status: 'Registration Successful!' });
          // });
          request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
            console.log(err || message);
            if (err) throw err;
            return res.status(200).json({ status: 'Registration Successful! Kindly check your mailbox to activate your account' });
          });

        });
      });
    });
  }
});

/**
 * Resending verification mail
 */
router.post('/resend', function (req, res, next) {
  User.findByUsername(req.body.username.trim().toLowerCase(), function (err, user) {
    if (err || !user || user == null) {
      return res.status(403).json({
        message: 'User doesnt exist'
      })
    }
    if (user.verified == true) {
      return res.status(200).json({
        message: 'User Already Verified!!'
      })
    }
    let formData = {
      subject: "User Verification from APAARR PROCUREMENT SERVICES",
      message: "Hi, <br> Please click the following link to activate your account <br><br> <a href=\"http://app.apaarr.com/#/activate/" + urlCrypt.cryptObj(user._id) + "\"> Verify </a><br><br><br> Regards, <br> Apaarr Procurement Services.",
      to: user.username
    };
    // server.send({
    //         text: "Hi, \n Please click the following link to activate your account http://app.apaarr.com/#/activate/" + urlCrypt.cryptObj(user._id)  +"\n Regards, \n Apaarr Procurement Services.",
    //         from: "Vishal <vishalvishal619@gmail.com>",
    //         to: user.name + "<" + user.username + ">",
    //         bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
    //         subject: "User Verification from APAARR PROCUREMENT SERVICES"
    //       }, function (err, message) {
    //         console.log(err || message);
    //         if (err) throw err;
    //         return res.status(200).json({ message: 'Verification mail sent again. Kindly check your mailbox' });
    //       });
    request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
      console.log(err || message);
      if (err) throw err;
      return res.status(200).json({ message: 'Verification mail sent again. Kindly check your mailbox' });
    });
  })
})

/**
 * Login of user service
 */
router.post('/login', function (req, res, next) {
  /**
   * User authentication done using passport
   */
  req.body.username = req.body.username.trim().toLowerCase();
  passport.authenticate('local', function (err, user, info) {

    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        err: info
      });
    }

    req.logIn(user, function (err) {          // Trying to login the user. Available inbuilt function in passport
      if (err) {
        return res.status(500).json({
          err: 'Could not login user'
        })
      }

      if (!user.verified) {
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
 * Sending Email using username
 */
router.post('/forgot', function (req, res, next) {
  /**
   * Sending forgot password link in mail
   */
  User.findByUsername(req.body.username.trim().toLowerCase(), function (err, user) {
    if (err || !user || user == null) {
      return res.status(403).json({
        message: 'User not found'
      })
    }

    console.log(user);
    // server.send({
    //   text: "Hi, \n Please click the following link to change your password http://app.apaarr.com/#/forgot-password/" + urlCrypt.cryptObj(user._id) + "\n Regards, \n Apaarr Procurement Services.",
    //   from: "Vishal <vishalvishal619@gmail.com>",
    //   to: user.name + "<" + user.username + ">",
    //   bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
    //   subject: "Password Change request - from APAARR PROCUREMENT SERVICES"
    // }, function (err, message) {
    //   console.log(err || message);
    //   return res.status(200).json({ message: 'A link has been sent to your mail! Use it to reset your password' });
    // });
    let formData = {
      to: user.username,
      subject: "Password Change request - from APAARR PROCUREMENT SERVICES",
      message: "Hi "+user.name+", <br> Please click the following link to change your password <br><a href=\"http://app.apaarr.com/#/forgot-password/" + urlCrypt.cryptObj(user._id) + "\">Click here</a><br><br> Regards, \n Apaarr Procurement Services."
    }

    request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
      console.log(err || message);
      if (err) throw err;
      return res.status(200).json({ message: 'A link has been sent to your mail! Use it to reset your password' });
    });
    
  })
})

/**
 * Forgot password from email
 */
router.post('/forgotPassword/:id', function (req, res, next) {
  /**
   * forgot password link
   */
  const id = urlCrypt.decryptObj(req.params.id);
  User.findById(id, function (err, resp) {
    if (err || !resp || resp == null) {
      return res.status(403).json({ message: 'This user does not exist' });
    }
    User.findByUsername(req.body.username.toLowerCase(), function (err, sanitizedUser) {
      if (sanitizedUser && (sanitizedUser._id == id)) {
        sanitizedUser.setPassword(req.body.password, function () {
          sanitizedUser.save();
          // server.send({
          //   text: "Hi, \n Your password has been changed now. Kindly check apaarr.com if it is not done by you. \n \n Regards, \n Apaarr Procurement Services.",
          //   from: "Vishal <vishalvishal619@gmail.com>",
          //   to: sanitizedUser.name + "<" + sanitizedUser.username + ">",
          //   bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
          //   subject: "Password Changed Successfully - from APAARR PROCUREMENT SERVICES"
          // }, function (err, message) {
          //   console.log(err || message);
          //   return res.status(200).json({ status: 'password reset successful' });
          // });
          let formData = {
            to: sanitizedUser.username,
            subject: "Password Changed Successfully - from APAARR PROCUREMENT SERVICES",
            message: "Hi "+sanitizedUser.name +", <br> Your password has been changed now. Kindly check apaarr.com if it is not done by you. <br> <br> Regards, <br> Apaarr Procurement Services."
          }
      
          request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
            console.log(err || message);
            if (err) throw err;
            return res.status(200).json({ status: 'password reset successful' });
          });

        });
      } else {
        res.status(500).json({ message: 'This user does not exist. Send us a mail, if problem persist' });
      }
    })
  })
})

/**
 * Activation a particular user by clicking on the refferal link
 */
router.post("/activate/:id", function (req, res, next) {
  /**
 * User authentication done using passport
 */
  passport.authenticate('local', function (err, user, info) {

    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        err: info
      });
    }

    req.logIn(user, function (err) {          // Trying to login the user. Available inbuilt function in passport
      if (err) {
        return res.status(500).json({
          err: 'Could not login user'
        })
      }

      const id = urlCrypt.decryptObj(req.params.id);

      User.findByIdAndUpdate(id, { '$set': { 'verified': true } }, { new: true }, function (err, resp) {
        if (err) throw err;
        console.log("response ----- " + JSON.stringify(resp));

        // server.send({
        //   text: "Hi " + resp.name + ", \n Your verification process is successfull. You can now login and get more informations." + "\n Regards, \n Apaarr Procurement Services.",
        //   from: "Vishal <vishalvishal619@gmail.com>",
        //   to: resp.name + "<" + resp.username + ">",
        //   bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
        //   subject: "Verification successfull - APAARR PROCUREMENT SERVICES"
        // }, function (err, message) {
        //   if (err) throw err;
        //   res.status(200).json({
        //     status: 'Activation Successful',
        //     success: true
        //   });
        // });

        let formData = {
          to: resp.username,
          subject: "Verification successfull - APAARR PROCUREMENT SERVICES",
          message: "Hi " + resp.name + ", <br> Your verification process is successfull. You can now login and get more informations." + "<br> Regards, <br> Apaarr Procurement Services."
        }
    
        request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
          console.log(err || message);
          if (err) throw err;
          res.status(200).json({
            status: 'Activation Successful',
            success: true
          });
      });
      })

    })
  })(req, res, next);
})

/**
 * Updating a particular user
 */
router.post('/updateUser', Verify.verifyOrdinaryUser, function (req, res) {
  // if(req.body.has(username || password)) {
  //   res.status(403).json({
  //     status: 'Not Authorized',
  //     message: 'You are not allowed to do the specified action'
  //   })
  // }

  User.findByIdAndUpdate(req.decoded._doc._id, { '$set': req.body }, { new: true }, function (err, resp) {
    if (err) throw err;
    // server.send({
    //   text: "Hi " + req.body.name + ", \n This is a security email stating there is a change in your profile. Please login to apaarr.com and revert changes if it is not done by you. If you did this then leave this mail." + "\n Regards, \n Apaarr Procurement Services.",
    //   from: "Vishal <vishalvishal619@gmail.com>",
    //   to: resp.name + "<" + resp.username + ">",
    //   bcc: "Vishal Srinivasan <vishalvishal619@gmail.com>",
    //   subject: "Profile update APAARR PROCUREMENT SERVICES"
    // }, function (err, message) {
    //   console.log(err || message);
    //   return res.status(200).json({
    //     status: 'success',
    //     message: 'Your changes are saved successfully'
    //   })
    // });

    let formData = {
      to: resp.username,
      subject: "Verification successfull - APAARR PROCUREMENT SERVICES",
      message: "Hi " + req.body.name + ", <br> This is a security email stating there is a change in your profile. Please login to apaarr.com and revert changes if it is not done by you. If you did this then leave this mail." + "<br> Regards, <br> Apaarr Procurement Services."
    }

    request.post({ url: "http://apaarr.com/generic_mail.php", formData: formData }, function (err, message) {
      console.log(err || message);
      if (err) throw err;
      res.status(200).json({
        status: 'success',
        message: 'Your changes are saved successfully',
        success: true
      });
  });

  })

})

/**
 *  Adding another person as admin 
 */
router.post('/addAdmin', function (req, res) {
  if (req.body.username.toLowerCase() == 'vishal@apaarr.com' && req.body.password == 'Ramamani123$') {
    User.findByUsername(req.body.admin.username, function (err, user) {
      if (err) throw err;
      if (req.body.admin.status == true) {
        user.admin = true;
      } else {
        user.admin = false;
      }
      user.save(function (err, resp) {
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
router.get('/logout', function (req, res) {
  req.logout();
  res.status(200).json({
    message: 'Bye!!'
  });
});

module.exports = router;
