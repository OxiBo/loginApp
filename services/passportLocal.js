const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  User = require("../models/User"),
  mongoose = require("mongoose");
// const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local",
  new LocalStrategy(
    // { usernameField: "username", passwordField: "password" },
    (username, password, done) => {
      //   console.log(username);
      User.findOne({ "local.username": username }).then(foundUser => {
        // console.log("found user" + foundUser);
        if (foundUser) {
          done(null, foundUser);
        } else {
          const newUser = new User();
          //   new User({
          //     local: {
          //       username,
          //       password: generateHash(password)
          //     }
          //   })
          newUser.local.username = username;
          newUser.local.password = newUser.generateHash(password);
          newUser
            .save()
            .then(user => done(null, user))
            .catch(err => {
              require.flash("error", err.message);
              res.redirect("/signup");
              console.log(err);
            });
        }
      });
    }
  )
);
