const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary");


cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {
        folder : 'wanderlust_DEV',   //Name of the folder to be saved on the cloud
        allowedFormat : ['png', 'jpeg','jpg'],  //This can be pdf, text or any other file
    }
});

module.exports = {cloudinary, storage};