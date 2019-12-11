const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    // console.log(req.user);
    // res.sendFile(`${process.env.PWD}/login.html`);
    res.render('login', {
        title: 'Login',
        css: 'login'
    })
})

router.post('/', (req, res) => {

})

module.exports = router;