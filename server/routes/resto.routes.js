import { Router } from "express";
import { createResto, deleteResto, getAllRestos, getRestoById, getRestosByCategory, getRestosByLocation, updateRestoDetails, updateRestoLogo } from "../controllers/resto.controller.js";
import { verifyAdmin, verifyJWT, verifyOwner } from "../middlewares/auth.middleware.js";



const router = Router();


router.route("/restaurants")
.get(getAllRestos)
.post(verifyJWT, createResto);

router.route("/restaurants/:id")
.get(getRestoById)
.put(verifyJWT, updateResto)
.delete(verifyJWT, deleteResto);


router.route("/restaurants/category/:category")
.get(getRestosByCategory);

router.route("/restaurants/location/:city")
.get(getRestosByLocation);

router.route("/update-details/:restoId")
.patch(updateRestoDetails);

router.route("/update-logo/:restoId")
.patch(updateRestoLogo);




export default router;



