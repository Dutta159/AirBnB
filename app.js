const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());

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
app.get("/listings", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

//New route
app.get("/listings/new", (req,res)=>{
    res.render("./listings/new.ejs");
});

//Show route
app.get("/listings/:id", async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
});

//create route
app.post("/listings", async (req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//Edit route
app.get("/listings/:id/edit", async (req,res)=>{
    const {id} = req.params;
    const listing =  await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
});

//update route
app.put("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    console.log(req.body.listing);
    await Listing.findByIdAndUpdate(id, {...req.body.listing});  //This deconstructs all the data from the body and passes to database
    res.redirect(`/listings/${id}`);
}); 


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


app.listen(3000, ()=>{
    console.log("Listening at port 3000");
});
