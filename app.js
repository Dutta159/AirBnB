const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs",ejsMate);  //Used for ejs mate
app.use(express.static(path.join(__dirname,"public")));

main().then(res => {
    console.log("successfully connected to the database");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/", (req,res)=>{
    res.send("Home page has been started");
});


const validateListing =(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
            let errmsg = error.details.map((el)=>el.message).join(",");  //This can be used to print all details
            throw new ExpressError(400, error);
        }
        else{
            next();
        }
}
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

//This is the index route
app.get("/listings", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({}); 
    res.render("./listings/index.ejs", {allListings});
}));

//New route
app.get("/listings/new", (req,res)=>{
    res.render("./listings/new.ejs");
});

//Show route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id).populate("reviews"); //This will save the object instead of the ids for the reviews
    res.render("./listings/show.ejs", {listing});
}));

//create route
//In this validateListing is passed as a middleware 
app.post("/listings", validateListing, wrapAsync(
    async (req,res)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

//Edit route
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));

//update route
app.put("/listings/:id",validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    console.log(req.body.listing);
    await Listing.findByIdAndUpdate(id, {...req.body.listing});  //This deconstructs all the data from the body and passes to database
    res.redirect(`/listings/${id}`);
})); 


//Delete route
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


//Reviews
//Post route
//In this validateReview is passed as a middleware
app.post("/listings/:id/reviews",validateReview, wrapAsync(
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
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(
    async (req,res)=>{
        let {id, reviewId} = req.params;
        await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    }
));


// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "California",
//         country : "USA"
//     })
//     await sampleListing.save();
//     console.log("Save to the database");
//     res.send("Successful");
// });

app.all("*", (req,res,next)=>{   //* means applicable to all the routes
    next(new ExpressError(404, "Page not found"));
});


app.use((err, req,res, next)=>{
    let {statusCode = 500, message = "An Error has occurred"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("./listings/error.ejs", {message,statusCode});
});

app.listen(3000, ()=>{
    console.log("Listening at port 3000");
});
