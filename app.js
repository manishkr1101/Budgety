require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const ejs = require('ejs')
const mongoose = require('mongoose')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const session = require('express-session')

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(session({
    secret: 'my name is manish',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
const User = require('./api/models/user');
passport.use(User.createStrategy())
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/budgety"
  },
  function(accessToken, refreshToken, profile, cb) {
    //   console.log(profile)
    let object = { 
        googleId: profile.id, 
        name: profile.displayName, 
        imgUrl: profile.photos[0].value, 
        username: profile.emails[0].value 
    }
    User.findOrCreate(object, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/budgety', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


mongoose.connect(`mongodb+srv://manish:${process.env.MONGO_ATLAS_PASSWORD}@cluster0-rp3y8.mongodb.net/budgetyDB`, {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true});




const loginRoutes = require('./api/routes/login')
const signupRoutes = require('./api/routes/signup')
const dataRoutes = require('./api/routes/data')

app.use('/login', loginRoutes)
app.use('/signup', signupRoutes)
app.use('/data', dataRoutes)

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }
    else{
        res.redirect('/login')
    }
}

app.get('/', checkAuth, (req, res) => {
    console.log(req.user);
    const options = {
        title: 'Home',
        css: 'styles',
        user: {
            name: req.user.name,
            email: req.user.username,
            imgUrl: req.user.imgUrl
        }
    }
    res.render('index', options)
})

app.get('/logout', checkAuth, (req, res) => {
    req.logOut();
    res.redirect('/login')
})





app.listen(process.env.PORT || 3000, () => {
    console.log(`server is running at localhost:${process.env.PORT | 3000}`);
});