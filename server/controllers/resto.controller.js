import { isValidObjectId } from "mongoose";
import  { Resto }  from "../models/resto.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";



const createResto = asyncHandler(async(req, res, next) => {
    try{
        const { restoName, email, restoContact, address, city, postalCode, lat, long, openingTime, closingTime, status, categories } = req.body;

        const owner = req.user._id;

        if(!restoName || !email || !restoContact || !address || !city || !postalCode || !lat || !long || !openingTime || !closingTime || !status || categories.length == 0){
            throw new ApiError(400, "All fields are mandatory");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            throw new ApiError(400, "Invalid email format");
        }

        const contactRegex = /^[0-9]+$/;
        if(!contactRegex.test(restoContact)){
            throw new ApiError(400, "Invalid Contact number format");
        }

        if(lat < -90 || lat > 90){
            throw new ApiError(400, "Latitude must be between -90 and 90")
        } 

        if(long < -180 || long > 180){
            throw new ApiError(400, "Longitude must be between -180 and 180");
        }

        if(openingTime >= closingTime){
            throw new ApiError(400, "Opening Time must be before closing time");
        }

        if(!["open", "closed"].includes(status)){
            throw new ApiError(400, "Status must be either 'open' or 'closed'");
        }

        if(req.file){
            const logoLocalPath = req.file?.path;
            const logo = await uploadOnCloudinary(logoLocalPath);
            if(!logo){
                throw new ApiError(400, "Logo file corrupted, please try again later...");
            }

            const newResto = new Resto({
                restoName,
                owner,
                email,
                restoContact,
                location : {
                    address,
                    city,
                    postalCode,
                    coordinates : {
                        lat,long
                    },
                },
                categories,
                operatingHours : {
                    openingTime,
                    closingTime
                },
                status,
                logo : {
                    public_id : logo.public_id,
                    secure_url : logo.secure_url
                }
            });

            await newResto.save();

            return res.status(201)
            .json(
                new ApiResponse(
                    201,
                    newResto,
                    "Restaurant Created Successfully"
                )
            )


        }else{
            throw new ApiError(400, "Restaurant Logo is required!!");
        }

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while creating new Restaurant");
    }
})

const getAllRestos = asyncHandler(async(req, res, next) => {
    try{
        const restos = await Resto.find().populate("owner").populate("menuItems").populate("reviews");

        if(restos.length == 0){
            return res.status(200).json(
                new ApiResponse(200, restos, "Restos doesn't exists")
            )
        }

        return res.status(200).json(
            new ApiResponse(200, restos, "All Restos Fetched successfully")
        );
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching");
    }
})

const getRestoById = asyncHandler(async(req, res, next) => {
    try{
        const { id } = req.params;
        if(!isValidObjectId(id)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const resto = await Resto.findById(id).populate('owner')
        .populate('menuItems')
        .populate('reviews');

        if(!resto){
            throw new ApiError(404, "Resto doesn't exists");
        }

        res.status(200).json(
            new ApiResponse(200, resto, "Resto successfully fetched")
        );
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching Restos by Id");
    }
})

const updateRestoDetails = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;
        const { restoName, address, city, postalCode, lat, long, openingTime, closingTime, status, categories } = req.body;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const resto = await Resto.findById(restoId);
        if(!resto){
            throw new ApiError(404, "Restaurant Not found !!");
        }
        if(resto.owner.toString() !== req.user._id.toString()){
            throw new ApiError(404, "You do not have permission to update this restaurant !!");
        }

        if(restoName) resto.restoName = restoName;
        if(address) resto.location.address = address;
        if(city) resto.location.city = city;
        if(postalCode) resto.location.postalCode = postalCode;
        if(lat && long){
            resto.location.coordinates.lat = lat;
            resto.location.coordinates.long = long;
        }
        if(categories) resto.categories = categories;
        if(openingTime || closingTime){
            if(openingTime) resto.operatingHours.openingTime = openingTime;
            if(closingTime) resto.operatingHours.closingTime = closingTime;
        }
        if(status) resto.status = status;

        await resto.save();

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                resto,
                "Restaurant details updated successfully"
            )
        );

    }catch(err){    
        console.error(`Error occurred while updating the resto details : ${err}`);
        throw new ApiError(400, err?.message ||  "Error occurred while updating the Restaurant Details");
    }
})

const updateRestoLogo = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;

        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const resto = await Resto.findById(restoId);
        if(!resto){
            throw new ApiError(404, "Restaurant does not exists !!");
        }

        if(req.file){
            const logoLocalPath = req.file?.path;
            const logo = await uploadOnCloudinary(logoLocalPath);
            if(!logo){
                throw new ApiError(400, "Logo file corrupted, please try again later..");
            }

            const prevLogoPublicId = resto.logo.public_id;

            resto.logo.public_id = logo.public_id;
            resto.logo.secure_url = logo.secure_url;

            await resto.save();

            await deleteFromCloudinary(prevLogoPublicId);

            return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    resto,
                    "Restaurant Logo Updated Successfully"
                )
            )
        }else{
            throw new ApiError(400, "Logo file is not provided !!");
        }
    }catch(err){
        console.error(`Error occurred while updating the Resto logo : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while updating the Restaurant Logo !!");
    }
})

const deleteResto = asyncHandler(async(req, res, next) => {

})

const getRestosByCategory = asyncHandler(async(req, res, next) => {

})

const getRestosByLocation = asyncHandler(async(req, res, next) => {

})


export {
    createResto,
    getAllRestos,
    getRestoById,
    updateRestoDetails,
    updateRestoLogo,
    deleteResto,
    getRestosByCategory,
    getRestosByLocation
}
