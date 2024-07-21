const wrapAsync = require("./utils/wrapAsync");
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");



module.exports.validateListing =(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");  //This can be used to print all details
            throw new ExpressError(400, error);
        }
        else{
            next();
        }
}

module.exports.validateReview =(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");  //This can be used to print all details
            throw new ExpressError(400, error);
        } 
        else{
            next();
        }
}

module.exports.isLoggedIn  = (req,res, next)=>{
    if(!req.isAuthenticated()){
        //Redirection urls using original url attribute of the req object
        //new variable is created below in the session
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
}


//This has to  be done since when a uses logs in the passport resets all the cookies and data so inorder to store the details we will store them in the locals
module.exports.saveRedirectUrl = (req,res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
} 


//The following is the middleware to authorization of the user.
module.exports.isOwner = wrapAsync(async(req,res, next)=>{
    const {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "Access Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
});


module.exports.isReviewAuthor = wrapAsync(async(req,res, next)=>{
    const {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "Access Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
});