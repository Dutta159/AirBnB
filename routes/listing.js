const express =  require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");




//This is the index route
router.get("/", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({}); 
    res.render("./listings/index.ejs", {allListings});
}));

//New route
router.get("/new", isLoggedIn,(req,res)=>{
    // console.log(req.user);
    res.render("./listings/new.ejs");
});

//Show route
router.get("/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner"); 
    //This include the nesting of the populate keyword for accessing a file inside a file that is populated
    //This will save the object instead of the ids for the reviews
    if(!listing){
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("./listings/show.ejs", {listing});
}));

//create route
//In this validateListing is passed as a middleware 
router.post("/",isLoggedIn, validateListing, wrapAsync(
    async (req,res)=>{
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New listing created!!");
        res.redirect("/listings");
}));

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
}));

//update route
router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    console.log(req.body.listing);
    await Listing.findByIdAndUpdate(id, {...req.body.listing});  //This deconstructs all the data from the body and passes to database
    req.flash("success", "Updated Successfully!!");
    res.redirect(`/listings/${id}`);
})); 


//Delete route
router.delete("/:id",isLoggedIn, isOwner,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect("/listings");
}));


module.exports =  router;