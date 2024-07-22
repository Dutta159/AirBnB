const express =  require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer"); //This is used to parse multi  part form data
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});
// const upload = multer({dest : "uploads/"});   //This can be used for the local storage



//This  is more compact method for storing routes
// general routes created - > Router was used - >Now router.route is used
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));
//This is the index route
//create route
//In this validateListing is passed as a middleware 


//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner,wrapAsync(listingController.destroyListings));
//Show route
//Delete route
//update route

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports =  router;