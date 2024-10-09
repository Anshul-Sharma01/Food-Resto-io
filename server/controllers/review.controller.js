import { isValidObjectId } from "mongoose";
import { MenuItem } from "../models/menuitems.model";
import { Resto } from "../models/resto.model";
import { Review } from "../models/review.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const calculateUpdatedRating = async(model, id) => {
    const reviews = await Review.find({ [model] : id });
    if(reviews.length == 0){
        return 0;
    }

    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = sumRatings / reviews.length;

    return avgRating;
}


const addNewReview = asyncHandler(async(req, res, next) => {
    try{
        const userId = req.user._id;
        const { rating, reviewContent, restoId, menuItemId } = req.body;
        
        if(!rating || !reviewContent || (!restoId && !menuItemId)){
            throw new ApiError(400, "Missing Required fields !!");
        }


        const newReview = await Review.create({
            user : userId,
            resto : restoId || null,
            menuItem : menuItemId || null,
            rating,
            reviewContent
        })

        const model = restoId ? "resto" : "menuItem";
        const avgRating = await calculateUpdatedRating(model, restoId || menuItemId);
        if (restoId) {
            await Resto.findByIdAndUpdate(restoId, {
                rating : avgRating,
                $inc: { numberOfRatings: 1 }
            });
        } else {
            await MenuItem.findByIdAndUpdate(menuItemId, {
                rating : avgRating,
                $inc: { numberOfRatings: 1 }
            });
        }

        return res.status(201)
        .json(
            new ApiResponse(
                201,
                newReview,
                "Review & Rating added successfully"
            )
        )


    }catch(err){
        console.error(`Error occurred while adding a new Review : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while adding a new Review !!");
    }
})

const editPrevReview = asyncHandler(async(req, res, next) => {
    try{
        const { reviewId } = req.params;
        const { rating, reviewContent } = req.body;

        if(!rating && !reviewContent){
            throw new ApiError(400, "At least one field is required to update a review !!");
        }

        const review = await Review.findById(reviewId);

        if(!review || review.user.toString() !== req.user._id.toString()){
            throw new ApiError(404, "Review not found or you are not authorized to edit this review !!");
        }

        review.rating = rating || review.rating;
        review.reviewContent = reviewContent || review.reviewContent;

        await review.save();

        const model = review.resto ? "resto" : "menuItem";
        const avgRating = await calculateUpdatedRating(model, review.resto || review.menuItem);

        if(review.resto){
            await Resto.findByIdAndUpdate(review.resto , { rating : avgRating });
        }else{
            await MenuItem.findByIdAndUpdate(review.menuItem, { rating : avgRating });
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                review,
                "Review updated successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while editing a review : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while updating a new review !!");
    }
})

const deleteReview = asyncHandler(async(req, res, next) => {
    try{
        const { reviewId } = req.params;
        if(!isValidObjectId(reviewId)){
            throw new ApiError(400, "Invalid Review Id");
        }

        const review = await Review.findById(reviewId);
        if(!review || review.user.toString() !== req.user._id.toString()){
            throw new ApiError(404, "Review not found or you are not authroized to delete this review !!");
        }

        await Review.findByIdAndDelete(reviewId);

        const model = review.resto ? "resto" : "menuItem";
        const avgRating = await calculateUpdatedRating(model, review.resto || review.menuItem);

        if(review.resto){
            await Resto.findByIdAndUpdate(review.resto, { rating : avgRating });
        }else{
            await MenuItem.findByIdAndUpdate(review.menuItem, { rating: avgRating });

        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                review,
                "Review Deleted successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while deleting a review : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while deleting a review !!");
    }
})

const fetchReviewsForResto = asyncHandler(async(req, res, next) => {
    try{
        const { restoId } = req.params;
        if(!isValidObjectId(restoId)){
            throw new ApiError(400, "Invalid Restaurant Id");
        }

        const reviews = await Review.find({ resto : restoId });


        return res.status(200)
        .json(
            new ApiResponse(
                200,
                reviews,
                "Reviews fetched Successfully"
            )
        )

    }catch(err){
        console.error(`Error occurred while fetching reviews for restaurant : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while fetching reviews for restaurant !!");
    }
})


const fetchReviewForItem = asyncHandler(async(req, res, next) => {
    try{
        const { itemId } = req.params;

        if(!isValidObjectId(itemId)){
            throw new ApiError(400, "Invalid Menu-Item Id");
        }

        const reviews = await Review.find({ menuItem : itemId })
        .populate("user", "name");

        if(!reviews || reviews.length == 0){
            throw new ApiError(404, "No reviews found for this menu item!!");
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                reviews,
                "Reviews fetched successfully"
            )
        );

    }catch(err){
        console.error(`Error occurred while fetching reviews for menuItems : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while fetching a review for menuItem");
    }
})

const fetchAllUserReviews = asyncHandler(async(req, res, next) => {
    try{
        const userId = req.user._id;
        
        const reviews = await Review.find({ user : userId })
        .populate("resto", "name")
        .populate("menuItem", "name");

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                reviews,
                "User Reviews fetched successfully !!"
            )
        )

    }catch(err){
        console.error(`Error occurred while fetching all user reviews : ${err}`);
        throw new ApiError(400, err?.message || "Error occurred while fetching all user reviews !!");
    }
})


export { 
    addNewReview,
    editPrevReview,
    deleteReview,
    fetchReviewsForResto,
    fetchReviewForItem,
    fetchAllUserReviews
}

