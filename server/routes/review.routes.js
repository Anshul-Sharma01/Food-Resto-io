import { Router } from "express";
import { addNewReview, deleteReview, editPrevReview, fetchAllUserReviews, fetchReviewForItem, fetchReviewsForResto } from "../controllers/review.controller";


const router = Router();

router.route("/create")
.post(addNewReview);

router.route("/update/:reviewId")
.patch(editPrevReview);

router.route("/delete/:reviewId")
.delete(deleteReview);

router.route("/fetch/:restoId")
.get(fetchReviewsForResto);

router.route("/fetch/:itemId")
.get(fetchReviewForItem);

router.route("/fetch/my")
.get(fetchAllUserReviews);




export default router;