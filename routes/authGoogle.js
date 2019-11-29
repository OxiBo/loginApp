const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  mongoose = require("mongoose"),
  User = require("../models/user");

require("../services/passportGoogleAuth");

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", failureFlash: true }),
  (req, res) => {
    req.flash("success", "Logged in with Google! Welcome to our blog!");
    res.redirect("/secret");
  }
);
module.exports = router;

// (req, res, () => {
//     req.flash("success", "Logged in with Google! Welcome to our blog!");
//     //     res.redirect("/secret");
//     res.redirect("/secret");
//   })
