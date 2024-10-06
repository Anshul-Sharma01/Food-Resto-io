import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Resto } from "../models/resto.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { MenuItem } from "../models/menuitems.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addMenuItem = asyncHandler(async (req, res, next) => {
    try {
        const { restoId } = req.params;
        const { name, description, price, category } = req.body;


        if (!isValidObjectId(restoId)) {
            throw new ApiError(400, "Invalid Restaurant Id");
        }


        if (!name || !description || !price || !category) {
            throw new ApiError(400, "All fields are mandatory !!");
        }


        const resto = await Resto.findById(restoId);
        if (!resto) {
            throw new ApiError(404, "Restaurant doesn't exist");
        }


        if (req.file) {
            const itemLogoLocalPath = req.file.path;


            const logoImage = await uploadOnCloudinary(itemLogoLocalPath);
            if (!logoImage) {
                throw new ApiError(400, "Logo Image corrupted, please try again later...");
            }


            const newMenuItem = await MenuItem.create({
                name,
                description,
                price,
                category,
                resto: restoId,
                image: {
                    public_id: logoImage.public_id,
                    secure_url: logoImage.secure_url,
                },
            });

            await resto.updateOne({$push : {menuItems : newMenuItem._id}});

            return res.status(201).json(
                new ApiResponse(
                    201,
                    newMenuItem,
                    "New Menu Item added successfully"
                )
            );
        } else {
            throw new ApiError(400, "Logo of menuItem not uploaded, please try again later...");
        }
    } catch (err) {
        console.error(`Error occurred while adding new menuItem to the Restaurant: ${err.message}`);
        next(new ApiError(400, err.message || "Error occurred while adding a new menu Item"));
    }
});


const removeMenuItem = asyncHandler(async (req, res, next) => {
    try {
        const { restoId, itemId } = req.params;

        if (!isValidObjectId(restoId)) {
            throw new ApiError(400, "Invalid Restaurant Id");
        }
        if (!isValidObjectId(itemId)) {
            throw new ApiError(400, "Invalid Menu Item Id");
        }

        const resto = await Resto.findById(restoId);
        if (!resto) {
            throw new ApiError(404, "Restaurant does not exist !!");
        }


        const menuItem = await MenuItem.findById(itemId);
        if (!menuItem) {
            throw new ApiError(404, "Menu Item does not exist !!");
        }


        await resto.updateOne({ $pull: { menuItems: itemId } });


        await MenuItem.findByIdAndDelete(itemId);

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Menu Item removed successfully"
            )
        );
    } catch (err) {
        console.error(`Error occurred while removing the menu item from restaurant: ${err.message}`);
        next(new ApiError(400, err.message || "Error occurred while removing the menu Item"));
    }
});

const updateMenuItem = asyncHandler(async(req, res, next) => {
    try{

    }catch(err){

    }
})

const fetchMenuItem = asyncHandler(async(req, res, next) => {
    try{
        const { itemId } = req.params;
        if(!isValidObjectId(itemId)){
            throw new ApiError(400, "Invalid Menu Item Id");
        }

        const item = await MenuItem.findById(itemId);
        if(!item){
            throw new ApiError(404, "Menu Item does not exists");
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                item,
                "Menu Item fetched successfully"
            )
        )
        
    }catch(err){
        console.error(`Error occurred while fetching a menu item : ${err}`);
        throw new ApiError(400, err?.message ||  "Error occurred while fetching a menu item");
    }
})

const fetchAllMenuItems = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const resto = await Resto.findById(restoId).select("menuItems");
        if(!resto){
            throw new ApiError(404, "Restaurant does not exists !!");
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                resto,
                "Restaurant Menu Items fetched Successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while fetching all uu`)
    }
})


export {
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    fetchAllMenuItems,
    fetchMenuItem

}