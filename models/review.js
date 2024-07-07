const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    comment : String,
    rating  : {
        type : Number,
        min  : 1,
        max  : 5
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
});
//This will be a one to many model with the listings model and use ref as Review in listings
module.exports = mongoose.model("Review", reviewSchema);
