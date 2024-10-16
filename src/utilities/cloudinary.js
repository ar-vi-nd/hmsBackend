const cloudinary = require("cloudinary").v2;
const env = process.env.NODE_ENV||'development';
const config = require(`../../config/env/${env}.config.json`);
// console.log(config)

const fs = require("fs");
// import dotenv from 'dotenv'
// dotenv.config()

// dont know why but need to import dotenv here otherwise its not working

// console.log("inside cloudinary printing process.env :",process.env.CLOUDINARY_API_KEY)

// console.log(config.cloudinary.api_key)
cloudinary.config({ 
    
    cloud_name: config.cloudinary.cloud_name, 
    api_key: config.cloudinary.api_key, 
    api_secret: config.cloudinary.api_secret
});


const uploadOnCloudinary = async(localFilePath)=>{
    

    // console.log(process.env.CLOUDINARY_API_KEY)
    try {
        if(!localFilePath) return null
        
        // console.log("inside cloudinary " ,localFilePath)
       const response =  await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        // file has been uploaded successfully
        // console.log("file uploaded on cloudinary", response)s

        fs.unlinkSync(localFilePath)

    

        return response;
    } catch (error) {
         fs.unlinkSync(localFilePath)
        //  removes the file saved on server if upload on cloudinary fails
        // throw new ApiError(400,"File not uploaded on cloudinary : ",error)
        console.log("consoling error",error)
    }
}

const deleteFromCloudinary = async(cloudinaryFilePath,resource_type="image")=>{
    try{
        const response =  await cloudinary.uploader.destroy(cloudinaryFilePath,{resource_type:resource_type})
        return response
    }catch(error){
        throw new ApiError(400,"File not deleted from cloudinary : ",error)
    }
}

module.exports = {uploadOnCloudinary}