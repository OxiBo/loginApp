// https://dev.to/deammer/loading-environment-variables-in-js-apps-1p7p
require("dotenv").config();

const express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  GoogleStrategy = require("passport-google-oauth20").Strategy,
  FacebookStrategy = require("passport-facebook"),
  mongoose = require("mongoose"),
  cookieSession = require("cookie-session"),
  flash = require("connect-flash"),
  app = express();

require("./models/User");
// const User = mongoose.model("users");
// require("./services/passportLocal");

app.use(
  cookieSession({
    name: "session", // default value
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    keys: [process.env.COOKIE_KEY]
  })
);

app.use(passport.initialize()); // has to be before 'require("./routes/authRoutes")(app);'
app.use(passport.session()); // has to be before 'require("./routes/authRoutes")(app);'

//requiring routes
const localAuthRoutes = require("./routes/authLocal"),
  googleAuthRoutes = require("./routes/authGoogle"),
  facebookAuthRoutes = require("./routes/authFacebook");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// DATABASE config
const dataBaseUrl =
  process.env.DATABASEURL || "mongodb://localhost:27017/loginApp";
mongoose
  .connect(dataBaseUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch(err => {
    console.log("ERROR:", err.message);
  });

// this line have to go BEFORE passport configuration
app.use(flash()); // to have flash messages

// middleware for making info about current user available on every route
app.use((req, res, next) => {
  // res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//requiring routes
// require("./routes/authLocal")(app);
// require("./routes/authGoogle")(app);
// require("./routes/authFacebook")(app);
app.use(localAuthRoutes);
app.use(googleAuthRoutes);
app.use(facebookAuthRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secret");
  } else {
    req.flash("error", "You need a permission to visit this page");
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("loginApp is running on port " + PORT);
});
