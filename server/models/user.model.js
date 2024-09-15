import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    name : {
        type : String,
        required : [true, 'Name is required'],
        trim : true,
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : [true, "Email is already registered"],
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address"]
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        match : [/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must container atleast a number, a character and a special character"],
        select : false,
    },
    number : {
        type : String,
        required : [true, "Phone number is required"],
        unique : [true, "Phone number already registered"],
    },
    address : {
        type : String,
        required : [true, "Address is required"],
        trim : true
    },
    avatar : {
        public_id : {
            type : String,
            required : true,
        },
        secure_url : {
            type : String,
            required : true
        }
    },
    role : {
        type : String,
        enum: ['USER', 'ADMIN', 'RESTAURANT_OWNER'],
        default : 'USER'
    },
    refreshToken : {
        type : String,
        select : false
    },
    forgotPasswordToken : String,
    forgotPasswordExpiry : Date,
}, {
    timestamps : true
})

userSchema.pre('save', async function () {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
})

userSchema.methods = {
    generateAccessToken : function(){
        return jwt.sign(
            {
                _id : this._id,
                email : this.email,
                role : this.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    },
    generateRefreshToken : function(){
        return jwt.sign(
            {
                _id : this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    },
    isPasswordCorrect : async function(password) {
        return await bcryptjs.compare(password, this.password);
    },

    generatePasswordResetToken : async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
        return resetToken;
    }
}




export const User = mongoose.model("User", userSchema);




