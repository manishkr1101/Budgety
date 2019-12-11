const express = require('express')
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()){
        res.redirect('/')
    }
    else{
        next();
    }
}

router.get('/', checkAuth, (req, res) => {
    // console.log(req.user);
    // res.sendFile(`${process.env.PWD}/login.html`);
    res.render('login', {
        title: 'Login',
        css: 'login'
    })
})

router.post('/', checkAuth, (req, res) => {
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.logIn(user, err => {
        if(err){
            console.log(err)
            res.redirect('/login')

        }
        else{
            passport.authenticate('local')(req, res, () => {
                
                res.redirect('/');
            })
        }
    })
})

module.exports = router;