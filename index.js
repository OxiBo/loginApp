// https://scotch.io/tutorials/easy-node-authentication-setup-and-local

// https://dev.to/deammer/loading-environment-variables-in-js-apps-1p7p

// http://www.passportjs.org/docs/facebook/

require('dotenv').config();

const express = require('express'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  //   LocalStrategy = require("passport-local"),
  GoogleStrategy = require('passport-google-oauth20').Strategy,
  FacebookStrategy = require('passport-facebook'),
  mongoose = require('mongoose'),
  cookieSession = require('cookie-session'),
  flash = require('connect-flash'),
  axios = require('axios'),
  app = express();

require('./models/User');
// const User = mongoose.model("users");
// require("./services/passportLocal");

app.use(
  cookieSession({
    name: 'session', // default value
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    keys: [process.env.COOKIE_KEY],
  })
);

// Middleware to use Passport with Express, This is the basic express session({..}) initialization.
app.use(passport.initialize()); // has to be before 'require("./routes/authRoutes")(app);'
// Needed to use session with passport
app.use(passport.session()); // has to be before 'require("./routes/authRoutes")(app);'

//requiring routes
const localAuthRoutes = require('./routes/authLocal'),
  googleAuthRoutes = require('./routes/authGoogle'),
  facebookAuthRoutes = require('./routes/authFacebook');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// DATABASE config
const dataBaseUrl =
  process.env.DATABASEURL || 'mongodb://localhost:27017/loginApp';
mongoose
  .connect(dataBaseUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to DB!');
  })
  .catch((err) => {
    console.log('ERROR:', err.message);
  });

// this line have to go BEFORE passport configuration
app.use(flash()); // to have flash messages

// middleware for making info about current user available on every route
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

//requiring routes
// require("./routes/authLocal")(app);
// require("./routes/authGoogle")(app);
// require("./routes/authFacebook")(app);
app.use(localAuthRoutes);
app.use(googleAuthRoutes);
app.use(facebookAuthRoutes);

/*WHAT DOES SERIALIZE USER MEAN?
1. "express-session" creates a "req.session" object, when it is invoked via app.use(session({..}))
2. "passport" then adds an additional object "req.session.passport" to this "req.session".
3. All the serializeUser() function does is,
receives the "authenticated user" object from the "Strategy" framework, and attach the authenticated user to "req.session.passport.user.{..}"
3. So in effect during "serializeUser", the PassportJS library adds the authenticated user to end of the "req.session.passport" object.
This is what is meant by serialization.
This allows the authenticated user to be "attached" to a unique session. 
This is why PassportJS library is used, as it abstracts this away and directly maintains authenticated users for each session within the "req.session.passport.user.{..}"*/
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/*
WHAT DOES DE SERIALIZE USER MEAN?
1. Passport JS conveniently populates the "userObj" value in the deserializeUser() with the object attached at the end of "req.session.passport.user.{..}"
2. When the done (null, user) function is called in the deserializeUser(), Passport JS takes this last object attached to "req.session.passport.user.{..}", and attaches it to "req.user" i.e "req.user.{..}"
In our case, since after calling the done() in "serializeUser" we had req.session.passport.user.{someUserObj}, 
calling the done() in the "deserializeUser" will take that last object that was attached to req.session.passport.user.{..} and attach to req.user.{..} 
i.e. req.user.{someUserObj}
3. So "req.user" will contain the authenticated user object for that session, and you can use it in any of the routes in the Node JS app. 
eg. 
app.get("/dashboard", (req, res) => {
res.render("dashboard.ejs", {name: req.user.name})
})
*/
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/secret', (req, res) => {
  /*
  Passport JS provides a “req.isAuthenticated()” function, that
returns “true” in case an authenticated user is present in “req.session.passport.user”, or returns “false” in case no authenticated user is present in “req.session.passport.user”.
  */
  if (req.isAuthenticated()) {
    res.render('secret');
  } else {
    req.flash('error', 'You need a permission to visit this page');
    res.redirect('/home');
  }
});

// logout route
app.get('/logout', async (req, res) => {
  // https://developers.facebook.com/docs/facebook-login/reauthentication/
  if (req.user.facebook?.id) {
    try {
      await axios.delete(
        `https://graph.facebook.com/${req.user.facebook.id}/permissions?access_token=${req.user.facebook.token}`
      );
    } catch (err) {
      console.log(err);
    }
  }
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('loginApp is running on port ' + PORT);
});
