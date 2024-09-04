import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async(req, res, next) => {

})

const login = asyncHandler(async(req, res, next) => {

})

const logout = asyncHandler(async(req, res, next) => {

})

const getProfile = asyncHandler(async(req, res, next) => {

})

const updateUserDetails = asyncHandler(async(req, res, next) => {

})

const updateUserAvatar = asyncHandler(async(req, res, next) => {

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

