const express = require('express')
const router = express.Router();
const User = require('../models/user');
const passport = require('passport')

router.get('/', (req, res) => {
    res.render('signup', {
        title: 'Signup',
        css: 'login'
    })
})

router.post('/', (req, res) => {
    User.register({username: req.body.username, name: req.body.name}, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            res.send('user exist')
        }
        else{
            passport.authenticate('local')(req, res, function(){
                req.logOut();
                res.redirect('/login');
            })
        }
    })

})

module.exports = router;