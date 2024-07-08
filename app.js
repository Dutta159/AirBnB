const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");




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

app.use("/listings", listings);
//This means any route starting with the /listings will get directed to listings
app.use("/listings/:id/reviews", reviews);



app.all("*", (req,res,next)=>{   //* means applicable to all the routes
    next(new ExpressError(404, "Page not found"));
});


app.use((err, req,res, next)=>{
    let {statusCode = 500, message = "An Error has occurred"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("./error.ejs", {message,statusCode});
});

app.listen(3000, ()=>{
    console.log("Listening at port 3000");
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
