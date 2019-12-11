const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    res.render('signup', {
        title: 'Signup',
        css: 'login'
    })
})

router.post('/', (req, res) => {

})

module.exports = router;