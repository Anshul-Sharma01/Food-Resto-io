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
        const { itemId } = req.params;
        const { name, description, price, category } = req.body;
        if(!name && !description && !price && !category){
            throw new ApiError(400, "At Least one field is required");
        }
        
        if(!isValidObjectId(itemId)){
            throw new ApiError(400, 'Invalid Menu Item Id');
        }

        const item = await MenuItem.findById(itemId);
        if(!item){
            throw new ApiError(404, "Menu Item does not exists !!");
        }

        if(name) item.name = name;
        if(description) item.description = description;
        if(price && !isNaN(price)) item.price = price;
        if(category) item.category = category;
        
        await item.save();
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                item,
                "Menu Item updated successfully"
            )
        )
        
    }catch(err){
        console.error(`Error occurred while updating the menuItem : ${err}`);
        throw new ApiError(400, err?.message || "Error occcurred while updating the menuItem");
    }
})

const updateMenuItemLogo = asyncHandler(async(req, res, next) => {
    try{
        const { itemId } = req.params;
        if(!isValidObjectId(itemId)){
            throw new ApiError(400, "Invalid Menu Item Id");
        }

        const item = await MenuItem.findById(itemId);
        if(!item){
            throw new ApiError(404, "Menu Item does not exists !!");
        }

        if(req.file){
            const logoImageLocalPath = req.file?.path;
            const logoImage = await uploadOnCloudinary(logoImageLocalPath);
            if(!logoImage){
                throw new ApiError(400, "Logo Image corrupted, please try again later..");
            }

            item.image.public_id = logoImage.public_id;
            item.image.secure_url = logoImage.secure_url;

            await item.save();

            return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    item,
                    "Menu Item Logo updated successfully"
                )
            )

        }else{
            throw new ApiError(400, "Logo Image is required !!");
        }

    }catch(err){
        console.error(`Error occurred while updating the menu item logo : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while updating the menu item logo");
    }
})

const toggleItemAvailability = asyncHandler(async(req, res, next) => {
    try{
        const { itemId } = req.params;
        if(!isValidObjectId(itemId)){
            throw new ApiError(400, "Invalid Menu Item Id");
        }

        const item = await MenuItem.findById(itemId);
        if(!item){
            throw new ApiError(404, "Menu Item does not exists !!");
        }

        item.isAvailable = !item.isAvailable;

        await item.save();
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                item,
                "Menu Item availability updated successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while toggling the item availability  : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while updating the item availability");
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

const fetchAvailableItems = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const availableItems = await MenuItem.find({
            resto : restoId,
            isAvailable : true
        });

        if(!availableItems){
            throw new ApiError(404, "No available items found");
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                availableItems,
                "Available Menu Items fetched Successfully"
            )
        );


    }catch(err){
        console.error(`Error occurred while fetching all available menu items : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while fetching available menu items");
    }
})

const fetchItemCategories = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const categories = await MenuItem.distinct("category", {resto : restoId});
        
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                categories,
                "Menu Item categories fetched Successfully"
            )
        );

    }catch(err){
        console.error(`Error occurred while fetching items categories : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while fetching item categories");
    }
})

const searchMenuItems = asyncHandler(async(req, res, next) => {
    try{
        const { query } = req.params;
        if(!query){
            throw new ApiError(400, "Search Query is required !!");
        }

        const menuItems = await MenuItem.find({
            $or : [
                { name : {$regex : query, $options : "i"}},
                {category : {$regex : query, $options : "i"}}
            ]
        });

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                menuItems,
                "Search results fetched successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while searching for menu items : ${err}`);
        throw new ApiError(400, err.message || "Error occurred while searching for menu items");
    }
})

const sortAndFilterMenuItem = asyncHandler(async(req, res,next) => {
    try{
        const  { restoId } = req.params;
        const { sortBy, category, minPrice, maxPrice } = req.query;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant ID");
        }

        let filter = { resto : restoId };

        if(category){
            filter.category = category;
        }

        if(minPrice || maxPrice){
            filter.price = {};
            if(minPrice) filter.price.$gte = minPrice;
            if(maxPrice) filter.price.$lte = maxPrice;
        }

        let sortOption = {};
        switch(sortBy){
            case 'price' :
                sortOption.price = 1;
                break;
            case 'price_desc' :
                sortOption.price = -1;
                break;
            case 'rating' :
                sortOption.numberOfRatings = -1;
                break;
            case 'popularity' : 
                sortOption.numberOfRatings = -1;
                break;
            default : 
                sortOption.createdAt = -1;
        }

        const items = await MenuItem.find(filter).sort(sortOption);
        if(items.length == 0){
            return res.status(404)
            .json(
                new ApiResponse(
                    404,
                    items,
                    "No items found matching the criteria"
                )
            );
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                items,
                "Menu Items sorted and filtered successfully"
            )
        );

    }catch(err){
        console.error(`Error occurred while sorting and filtering menu items : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while sorting and filtering the menu items !!");
    }
})


export {
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    fetchAllMenuItems,
    fetchMenuItem,
    updateMenuItemLogo,
    toggleItemAvailability,
    fetchAvailableItems,
    fetchItemCategories,
    searchMenuItems,
    sortAndFilterMenuItem
}