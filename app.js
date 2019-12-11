require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const ejs = require('ejs')
const mongoose = require('mongoose')

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')

const loginRoutes = require('./api/routes/login')
const signupRoutes = require('./api/routes/signup')

app.use('/login', loginRoutes)
app.use('/signup', signupRoutes)

app.get('/', (req, res) => {
    const options = {
        title: 'Home',
        css: 'styles',
        user: {
            name: 'Manish Kumar',
            email: 'manishkr7424@gmail.com',
            imgUrl: 'images/profile.jpg'
        }
    }
    res.render('index', options)
})





app.listen(process.env.PORT || 3000, () => {
    console.log('server is running at localhost:3000');
});