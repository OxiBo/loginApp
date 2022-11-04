const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../models/User'),
  mongoose = require('mongoose');

passport.use(
  'local',
  new LocalStrategy(
    { passReqToCallback: true }, // how to get different form fields - https://stackoverflow.com/questions/36761291/how-can-i-store-other-form-fields-with-passport-local-js and documentation - https://github.com/jaredhanson/passport-local#parameters
    (req, username, password, done) => {
      User.findOne({ 'local.username': username })
        .then((foundUser) => {
          if (foundUser) {
            done(null, foundUser);
          } else {
            const newUser = new User();
            newUser.local = {
              username,
              email: req.body.email,
              age: req.body.age,
              occupation: req.body.occupation,
            };
            newUser.local.password = newUser.generateHash(password);

            newUser.save().then((user) => done(null, user));
          }
        })
        .catch((err) => {
          req.flash('error', err.message);
          res.redirect('/signup');
          console.log(err);
        });
    }
  )
);
