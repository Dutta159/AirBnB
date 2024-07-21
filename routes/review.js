const express = require("express");
const router = express.Router({mergeParams: true});//This helps to pass the parent parameter through the app.js to router like passing the listing id to the review.js
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");



//Reviews
//Post route
//In this validateReview is passed as a middleware
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports =  router;