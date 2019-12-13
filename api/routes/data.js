const express = require('express')
const router = express.Router();
const db = require('../models/data')

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }
    else{
        return res.status(401).json({err: 'Not Authorized'})
    }
}

router.get('/:year/:month', checkAuth, (req, res) => {
    const Data = db.getCollection(req.user._id);
    // console.log(req.params)
    const year = req.params.year;
    const month = req.params.month;

    const filter = {
        year: year,
        month: month
    }
    Data.findOne(filter, (err, doc) => {
        if(err) return;
        if(doc){
            // console.log(doc)
            res.status(200).json(doc.data)
        }
        else{
            res.status(200).json({
                allItems: {
                    exp: [],
                    inc: []
                },
                totals: {
                    exp: 0,
                    inc: 0
                },
                budget: 0,
                percentage: -1
            })
        }
    })
    
    // res.status(200).json({})
    
})

router.post('/', checkAuth, (req, res) => {
    console.log({
        body: req.body
    })
    const Data = db.getCollection(req.user._id);

    const year = req.body.year;
    const month = req.body.month;

    const filter = {
        year: year,
        month: month
    }
    const update = {
        data: req.body.data
    }

    Data.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true
    }, function(err, result){
        if(err) return;
        // console.log(result);
        res.status(301).json(result.data)
    })


    // const newData = new Data({
    //     year: year,
    //     month: month,
    //     data: {
    //         allItems: {
    //             exp: [],
    //             inc: []
    //         },
    //         totals: {
    //             exp: 0,
    //             inc: 0
    //         },
    //         budget: 0,
    //         percentage: -1
    //     }
        
    // })
    
    
})

module.exports = router;