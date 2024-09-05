import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { executionAsyncResource } from "async_hooks";


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
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if(!user){
        throw new ApiError(400, "Email not registered");
    }


    const resetToken = await user.generatePasswordResetToken();


    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

    const subject = "Reset Password Token";
    const message = `<p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        Hello,
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        We received a request to reset your password. You can easily reset it by clicking the button below:
    </p>
    <p style="text-align: center;">
        <a href="${resetPasswordURL}" target="_blank" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 16px;">Reset Your Password</a>
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        If the above button doesn't work, copy and paste the following link into your browser:
    </p>
    <p style="font-family: Arial, sans-serif; color: #007BFF; word-wrap: break-word; font-size: 16px;">
        <a href="${resetPasswordURL}" target="_blank" style="color: #007BFF; text-decoration: underline;">${resetPasswordURL}</a>
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        If you did not request a password reset, please ignore this message. The link is valid for 15 minutes only.
    </p>
    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
        Thank you,<br>U - Laundary 
    </p>`

    try{
        await sendEmail(email, subject, message);
        return res.status(200)
        .json(
            new ApiResponse(200, { },  `Reset Password has been sent to ${email} successfully`)
        );
    }catch(err){
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        throw new ApiError(400, err?.message || "Error occurred while sending Reset Token");
    }


})

const resetPassword = asyncHandler(async(req, res, next) => {
    try{
        const { resetToken } = req.body;
        const { password } = req.body;

        const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            forgotPasswordExpiry : { $gt : Date.now() },
            forgotPasswordToken
        })

        if(!user){
            throw new ApiError(400, "Token is invalid or expired, please try again...");
        }

        user.password = password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();

        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        );

    }catch(err){
        throw new ApiError(400, "Error occurred in updating new password");
    }
})

const changePassword = asyncHandler(async(req, res, next) => {
    try{
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        if(!oldPassword || !newPassword){
            throw new ApiError(400, "All fields are mandatory");
        }

        const user = await User.findById(userId).select("+password");

        if(!user){
            throw new ApiError(400, "User does not exists");
        }

        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordValid){
            throw new ApiError(400, "Invalid Old Password");
        }

        user.password = newPassword;
        await user.save();

        user.password = undefined;
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Password changed successfully"
            )
        );


    }catch(err){
        throw new ApiError(400, "Error occurred while changing the password");
    }
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

