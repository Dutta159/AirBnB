const User =  require("../models/user.js");

module.exports.renderSignupForm =  (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup =   async(req,res)=>{
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
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}


module.exports.login =  async(req,res)=>{
    req.flash("success","Welcome to WanderLust You are Logged in");
    let redirectUrl =  res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl); //This will redirect to the task you were doing after login like editing or new profile
}

module.exports.logout = (req,res, next)=>{
    //This function takes the callback that tells what to do after the user is logged out of the website
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    });
}