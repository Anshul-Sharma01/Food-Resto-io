import { mongo, Schema } from "mongoose";

const reviewSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    resto : {
        type : Schema.Types.ObjectId,
        ref : "Review",
    },
    menuItem : {
        type : Schema.Types.ObjectId,
        ref : 'MenuItem',
    },
    rating : {
        type : Number,
        required : true,
        min : [1, "Rating must be at least 1"],
        max : [5, "Rating can be at most 5"]
    },
    reviewContent : {
        type : String,
        required : true,
        maxLength : 500
    },
    date : {
        type : Date,
        default : Date.now
    }
}, {
    timestamps : true
})




export const Review = mongoose.model("Review", reviewSchema);