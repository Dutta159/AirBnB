const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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
    const listing =  await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));

//create route
app.post("/listings", wrapAsync(
    async (req,res)=>{
        if(!req.body.listing){
            throw new ExpressError(400,"All fields must be filled");
        }
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
app.put("/listings/:id",wrapAsync(async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"All fields must be filled");
    }
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
