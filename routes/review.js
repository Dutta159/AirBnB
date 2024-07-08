const express = require("express");
const router = express.Router({mergeParams: true});//This helps to pass the parent parameter through the app.js to router like passing the listing id to the review.js
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview =(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");  //This can be used to print all details
            throw new ExpressError(400, error);
        } 
        else{
            next();
        }
}

//Reviews
//Post route
//In this validateReview is passed as a middleware
router.post("/",validateReview, wrapAsync(
    async (req,res)=>{
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        console.log("New Review saved");
        res.redirect(`/listings/${listing._id}`);
    }
));

//Delete review route
router.delete("/:reviewId", wrapAsync(
    async (req,res)=>{
        let {id, reviewId} = req.params;
        await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    }
));

module.exports =  router;