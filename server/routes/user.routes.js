import { Router } from "express";
import { changePassword, forgotPassword, getProfile, registerUser, login, resetPassword, updateUserAvatar, updateUserDetails } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();



router.route("/register")
.post(registerUser);

router.route("/login")
.post(login);

router.route("/logout")
.get(logout);

router.route("/me")
.get(verifyJWT, getProfile);

router.route("/me/update")
.patch(verifyJWT, updateUserDetails);

router.route("/me/update/avatar")
.patch(verifyJWT, updateUserAvatar);

router.route("/password/forgot")
.post(forgotPassword);

router.route("/password/reset/:resetToken")
.patch(resetPassword);

router.route("/password/change")
.patch(verifyJWT, changePassword);




export default router;



