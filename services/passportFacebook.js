// https://developers.facebook.com/docs/facebook-login/permissions/requesting-and-revoking/

// https://hackernoon.com/passportjs-the-confusing-parts-explained-edca874ebead

// https://developers.facebook.com/docs/graph-api/using-graph-api/

const passport = require("passport"),
  FacebookStrategy = require("passport-facebook").Strategy,
  axios = require("axios"),
  mongoose = require("mongoose"),
  User = require("../models/user");
require("../services/passportFacebook");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});








// https://developers.facebook.com/apps/2460065867648943/settings/basic/
passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      auth_type: "reauthenticate"
    },
    async (accessToken, refreshToken, profile, cb) => {
      // console.log("======== PROFILE =======" + profile);
      // console.log("access token: " + accessToken)
      User.findOne({ "facebook.id": profile.id })
        .then(foundUser => {
          console.log(foundUser)
          if (foundUser) {
            // console.log(foundUser);
            return cb(null, foundUser);
          } else {
            new User({
              facebook: {
                id: profile.id,
                name: profile.displayName,
                token: accessToken
              }
            })
              .save()
              .then(user => {
                // console.log(user);
                return cb(null, user);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  )
);
