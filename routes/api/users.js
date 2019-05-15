const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bodyParser = require('body-parser');

const keys = require('../../config/key');
//import model
const User = require('../../models/User');

// //validate user
const validateRegisterInput = require('../../Validator/register')
const validateLoginInput = require('../../Validator/login')

//@routes GET api/users/test
//@desc   Test users route
//@access Public

router.get('/test', (req, res) => res.json({ msg: 'Users work' }));
//@routes GET api/users/register
//@desc   register user
//@access Public

router.post('/register', (req, res) => {

  const { errors, isValid } = validateRegisterInput(req.body)

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  console.log('registering user......................////////////');
  User.findOne({ email: req.body.email }).then(user => {

    if (user) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors)
    }
    else if (req.body.email === 'dhanmoninath@gmail.com') {
      const newUser = new User({
        admin: true,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              const payload = {
                admin: true,
                email: user.email,
                id: user.id,
                name: user.name,
                password: user.password,
              };
              jwt.sign(
                payload,
                keys.secretOrKey,
                { expiresIn: '7d' },
                (err, token) => {
                  res.json({
                    success: true,
                    token: token,
                  });
                }
              );
            })
            .catch(err => console.log(err));
        });
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        admin: false,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              const payload = {
                email: user.email,
                id: user.id,
                name: user.name,
                password: user.password,
                admin: false,
              };
              jwt.sign(payload, keys.secretOrKey, (err, token) => {
                res.json({
                  success: true,
                  token: token,
                });
              });
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});
//@routes GET api/users/login
//@desc   login user / returning JWT web token
//@access Public

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body)

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors)
    }

    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        //isMatched
        const payload = {
          email: user.email,
          id: user.id,
          name: user.name,
          admin: user.admin,
        };
        //sign token
        jwt.sign(payload, keys.secretOrKey, (err, token) => {
          res.json({
            success: true,
            token: token,
          });
        });
      } else {
        errors.password = 'Email password pair doesnot match!'
        return res.status(400).json(errors)
      }
    });
  });
});

//@routes GET api/users/current
//@desc   return current user
//@access Private
router.get(
  `/current`,
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      admin: req.user.admin,
    })
  }
);

module.exports = router;
