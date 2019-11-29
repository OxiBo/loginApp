const passport = require("passport"),
  GoogleStrategy = require("passport-google-oauth20").Strategy,
  mongoose = require("mongoose"),
  User = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_API_ID,
      clientSecret: process.env.GOOGLE_API_SECRET,
      callbackURL: "/auth/google/callback"
    },
    (token, tokenSecret, profile, done) => {
      User.findOne({ "google.id": profile.id }).then(foundUser => {
        if (foundUser) {
          done(null, foundUser);
        } else {
          new User({
            google: {
              id: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              token: token
            }
          })
            .save()
            .then(user => done(null, user))
            .catch(err => {
              console.log(err);
            });
        }
      });
    }
  )
);
