const mongoose = require('mongoose')

var data = {
    year: Number,
    month: Number,
    data: {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: Number,
            inc: Number
        },
        budget: Number,
        percentage: Number
    }
};

const dataSchema = new mongoose.Schema(data)

module.exports = {
    getCollection: function(collectionName){
        const name = mongoose.Types.ObjectId(collectionName).toHexString();
        const Data = new mongoose.model(name, dataSchema, name);
        return Data;
    }
}