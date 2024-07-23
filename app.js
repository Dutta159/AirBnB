if(process.env.NODE_ENV != "production"){
    require('dotenv').config();      //dotenv file is used only in development phase and not in the production phase
}
// console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash =  require("connect-flash");
const passport = require("passport");
const LocalStrategy =  require("passport-local");
const User =  require("./models/user.js");
const userRouter = require("./routes/user.js");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs",ejsMate);  //Used for ejs mate
app.use(express.static(path.join(__dirname,"public")));

//using dbUrl as the url will store the data in the cloud mongo
const dbUrl = process.env.ATLASDB_URL;

const store  = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 3600*24,
    // This is the interval between a session update 
});
store.on("error", ()=>{
    console.log("Mongo Session store error", err);
});

const sessionOptions = {
    store : store,
    secret: process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge : 1000 * 60 * 60 * 24 * 3,
        httpOnly:true,  //used to prevent cross scripting attacks
    }
};




main().then(res => {
    console.log("successfully connected to the database");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// app.get("/", (req,res)=>{
//     res.send("Home page has been started");
// });

app.use(session(sessionOptions));
app.use(flash());//To be used before routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//Storing and unstoring information relating to the user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success"); //Any msg with success as code will be saved in the given variable
    res.locals.error = req.flash("error"); //Any msg with success as code will be saved in the given variable
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listings);
//This means any route starting with the /listings will get directed to listings
app.use("/listings/:id/reviews", reviews);
app.use("/", userRouter);



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
