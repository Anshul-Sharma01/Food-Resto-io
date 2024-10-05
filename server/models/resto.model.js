import mongoose, { Schema } from "mongoose";


const restoSchema = new Schema({
    restoName : {
        type : String,
        required : [true ,'Restaurant Name is required'],
        trim : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : [true, "Restaurant owner is required"]
    },
    email : {
        type : String,
        required : [true, "Restaurant Email is required"]
    },
    restoContact : {
        type : String,
        required : [true, "Restaurant contact number is required"],
        unique : [true , 'Restaurant Contact number must be unique'],
    },
    location : {
        address : {
            type : String,
            required : [true, 'Restaurant Location is required'],
        },
        city : {
            type : String,
            required : [true, "Restaurant City is required"],
        },
        postalCode : {
            type : String,
            required : [true, "Restaurant Postal Code is required"],
        },
        coordinates : {
            lat : {
                type : Number,
                min : -90,
                max : 90
            },
            long : {
                type : Number,
                min : -180,
                max : 180
            }
        }
    },
    categories : [
        {
            type : String,
            required : [true, "At least one category is required"],
        }
    ],
    menuItems : [
        {
            type : Schema.Types.ObjectId,
            ref : 'MenuItem'
        }
    ],
    rating : {
        type : Number,
        default : 0,
    },
    numberOfRatings : {
        type : Number,
        default : 0
    },
    operatingHours : {
        openingTime : {
            type : Date,
            required : [true, "Opening time is required"],
        },
        closingTime : {
            type : String,
            required : [true, "Closing time is required"],
        }
    },
    logo : {
        public_id : {
            type : String,
            required : true,
        },
        secure_url : {
            type : String,
            required : true
        }
    },
    status : {
        type : String,
        required : [true, "Restaurant current status is required"],
        enum : ["open", "closed", "inActive"]
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],


}, {
    timestamps : true
})

export const Resto = mongoose.model("Resto", restoSchema);



