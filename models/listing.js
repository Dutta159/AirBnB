const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { array } = require("joi");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    description : String ,
    image : {
      url : String,
      filename : String
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      }
    ],
    owner : {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    coordinates :{
      type : Array,
    },
    //This is a bad practice actually data should be stored in geoJson format
    // category :{
    //   type : String,
    //   enum : ["Mountains", "Deserts", "Cities", "Monuments"] 
    // }
});


//This is a post mongoose middleware
//This will delete the reviews from the review collection after deleting from the listing collection
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await Review.deleteMany({_id : {$in : listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;