import { Schema } from "mongoose";


const menuItemSchema = new Schema({
    name : {
        type : String,
        required : [true, "Menu Item name is required"],
    },
    description : {
        type : String,
        required : [true, "Menu Item description is required"],
        maxLength : 500
    },
    price : {
        type : Number,
        required : [true, 'Menu Item Price is required '],
        min : [0, "Price cannot be negative"]
    },
    category : {
        type : String,
        required : [true, 'Menu Item category is required'],
    },
    isAvailable : {
        type : Boolean,
        default : true
    },
    image : {
        public_id : {
            type : String,
            required : true
        },
        secure_url : {
            type : String,
            required : true
        }
    },
    resto : {
        type : Schema.Types.ObjectId,
        ref : "Resto",
        required : [true, "The name os Restaurant is required"],
    },
    reviews :[
        {
            
            type : Schema.Types.ObjectId,
            ref : "Review"
            
        }
    ],
    numberOfRatings : {
        type : Number,
        default : 0
    },

},{
    timestamps : true
})

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);





