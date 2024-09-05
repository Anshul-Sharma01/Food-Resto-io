import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000,
    secure : true,
    httpOnly : true
}


const generateAcessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave : false
        });
        return { accessToken, refreshToken };
    }catch(err){
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens");
    }
}


const registerUser = asyncHandler(async(req, res, next) => {
    try{   
        const { name, email, password, number, address } = req.body;

        if(!name || !email || !password || !number || !address){
            throw new ApiError(400, "All fields are mandatory");
        }

        const emailExists = await User.findOne({email});
        if(emailExists){
            throw new ApiError(400, "Email already Exists");
        }

        const numberExists = await User.findOne({number});
        if(numberExists){
            throw new ApiError(400, "Number already registered");
        }

        if(req.file){
            const localFilePath = req.file?.path;

            if(!localFilePath){
                throw new ApiError(400, "Avatar not uploaded, please try again..");
            }

            const avatar = await uploadOnCloudinary(localFilePath);

            if(!avatar){
                throw new ApiError(400, "Avatar file uploading failed, please try again..");
            }

            const user = await User.create({
                name, email, password, number, address,
                avatar : {
                    public_id : avatar.public_id,
                    secure_url : avatar.secure_url
                }
            })

            if(!user){
                throw new ApiError(400, "Account not created, please try again...");
            }

            return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "User Registered successfully"
                )
            );
            
        }else{  
            throw new ApiError(400, "Avatar is required for account creation");
        }

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while registering new user");
    }
})

const login = asyncHandler(async(req, res, next) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            throw new ApiError(400, "All fields are mandatory");
        }

        const user = await User.findOne({ email });
        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if(!isPasswordValid){
            throw new ApiError(400, "Password is not correct");
        }

        const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(user._id);

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user, refreshToken, accessToken},
                "User logged in successfully"
            )
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while logging in user");
    }
})

const logout = asyncHandler(async(req, res, next) => {
    try{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset : {
                    refreshToken : null
                }
            },
            {
                new : true
            }
        )

        return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged Out successfully"
            )
        );

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while trying to log out");
    }
})

const getProfile = asyncHandler(async(req, res, next) => {
    try{
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User Profile fetched successfully"
            )
        )

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while fetching user profile");
    }
})

const updateUserDetails = asyncHandler(async(req, res, next) => {
    try{
        const { name, address } = req.body;
        const userId = req.user._id;

        if(!name || !address){
            throw new ApiError(400, "At least one field is required for updation");
        }
        let updationFields = {};

        if(name){
            updationFields.name = name;
        }
        if(address){
            updationFields.address = address;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set : updationFields},
            {new : true}
        )

        if(!user){
            throw new ApiError(400, "User details not updated, please try again later..");
        }

        return res.status(200)
        .json(new ApiResponse(
            200,
            user,
            "User Details Updated Successfully"
        ))

    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating user details");
    }
})

const updateUserAvatar = asyncHandler(async(req, res, next) => {
    try{
        const userId = req.user._id;
        if(req.file){
            const user = await User.findById(userId);

            const previousPathId = user.avatar.public_id;
            
            const localFilePath = req.file?.path;
            if(!localFilePath){
                throw new ApiError(400, "file not uploaded, please try again");
            }

            const avatar = await uploadOnCloudinary(localFilePath);
            if(!avatar){
                throw new ApiError(400, "File not uploaded on cloudinary, please try again later...");
            }

            user.avatar.public_id = avatar.public_id;
            user.avatar.secure_url = avatar.secure_url;

            await user.save();

            await deleteFromCloudinary(previousPathId);

            return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Avatar updated successfully"
                )
            )

        }else{
            throw new ApiError(400, "Avatar file is required for updation");
        }
    }catch(err){
        throw new ApiError(400, err?.message || "Error occurred while updating user avatar");
    }
})

const forgotPassword = asyncHandler(async(req, res, next) => {

})

const resetPassword = asyncHandler(async(req, res, next) => {

})

const changePassword = asyncHandler(async(req, res, next) => {

})

export { 
    registerUser,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    getProfile,
    updateUserAvatar,
    updateUserDetails
}

