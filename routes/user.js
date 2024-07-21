const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User =  require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(
    async(req,res)=>{
        try{
            let {username, email , password} = req.body;
            const newUser = new User({email, username});
            const registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
            req.login(registeredUser, (err)=>{
                if(err){
                    return next(err);
                }
                req.flash("success", "User registered successfully !!");
                res.redirect("/listings");
            });

        }catch(err){
            req.flash("error", err.message);
            res.redirect("/signup");
        }
}));

router.get("/login", (req,res)=>{
    res.render("users/login.ejs");
});


//Route middleware to authenticate requests - passport.authenticate()
router.post("/login",saveRedirectUrl, passport.authenticate("local",{failureRedirect : '/login', failureFlash : true}), wrapAsync(
    async(req,res)=>{
        req.flash("success","Welcome to WanderLust You are Logged in");
        let redirectUrl =  res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl); //This will redirect to the task you were doing after login like editing or new profile
}));

router.get("/logout", (req,res, next)=>{
    //This function takes the callback that tells what to do after the user is logged out of the website
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
});

module.exports = router;