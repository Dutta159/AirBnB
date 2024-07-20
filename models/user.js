const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
//The above import will automatically add username,hash and salt field in the user schema to store username , password and the salt value

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user", userSchema);