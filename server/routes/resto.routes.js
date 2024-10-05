import { Router } from "express";
import { createResto, deleteResto, getAllRestos, getOpenRestos, getRestoById, getRestosByCategory, getRestosByLocation, getTopRatedRestos, restoreInActiveRestos, searchRestos, softDeleteResto, updateRestoDetails, updateRestoLogo } from "../controllers/resto.controller.js";
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


router.route("/get-open-restos")
.get(getOpenRestos);

router.route("/search")
.get(searchRestos);

router.route("/top-rated")
.get(getTopRatedRestos);

router.route("/soft-delete/:restoId")
.get(softDeleteResto);

router.route("/restore-inactive-resto/:restoId")
.get(restoreInActiveRestos);

router.route("/delete/:restoId")
.delete(verifyOwner, deleteResto);


export default router;



