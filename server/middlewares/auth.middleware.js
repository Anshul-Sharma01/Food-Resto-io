import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async(req, res, next) => {
    try{
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer", " ");

        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id);
        
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();

    }catch(err){
        throw new ApiError(401, err?.message || "Invalid access token");
    }
})


export const verifyAdmin = asyncHandler(async(req, res, next) => {
    try{
        const { user } = req;

        if(!user || user.role !== 'admin'){
            throw new ApiError(403, "Access Forbidden");
        }
        next();

    }catch(err){
        throw new ApiError(403, err?.message || "Access to this particular route is forbidden");
    }
})

