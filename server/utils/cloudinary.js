import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async( localFilePath ) => {
    try{
        if(!localFilePath){
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        }).catch((err) => {
            console.log(`Cloudinary error : ${err}`);
        })

        fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        fs.unlinkSync(localFilePath);
        return null;
    }
}


const deleteFromCloudinary = async( pathId ) => {
    try{
        const response = await cloudinary.uploader.destroy(
            pathId,{
                invalidate : true,
                resource_type : "auto"
            }
        )
    }catch(err){
        console.log(`Error occurred while deleting file from cloudinary : ${err}`);
        return null;
    }
}




export { 
    uploadOnCloudinary,
    deleteFromCloudinary
}





