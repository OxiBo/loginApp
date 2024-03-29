const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport');
//   flash = require("connect-flash");
// const User = require("../models/user");
const User = mongoose.model('users');
require('../services/passportLocal');
router.use(bodyParser.urlencoded({ extended: true }));
// router.use(flash())

router.get('/signup', (req, res) => {
  res.render('auth/register-form');
});

router.post('/signup', async (req, res) => {
  try {
    const foundUser = await User.findOne({
      'local.username': req.body.username,
    });

    if (foundUser) {
      req.flash('error', 'User with this name already exists');
      res.redirect('/signup');
    } else {
      passport.authenticate('local')(req, res, () => {
        req.flash('success', 'Welcome to our blog!');
        //     res.redirect("/secret");
        res.redirect('/secret');
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// show login form
router.get('/login', (req, res) => {
  res.render('auth/login-form');
});

router.post('/login', async (req, res, next) => {
  const foundUser = await User.findOne({ 'local.username': req.body.username });
  //   console.log(req.body.username);
  if (!foundUser) {
    // if no user is found, return the message
    req.flash('error', 'No user found');
    res.redirect('/home');
  } else if (!foundUser.validPassword(req.body.password)) {
    req.flash('error', 'Wrong password');
    res.redirect('/login');
  } else {
    passport.authenticate('local', {
      successRedirect: '/secret',
      failureRedirect: '/login',
      successFlash: 'Welcome!',
      failureFlash: true,
    })(req, res, next);
  }
});

router.get('/registration', (req, res) => {
  res.send('registration page is not implemented');
});

module.exports = router;
