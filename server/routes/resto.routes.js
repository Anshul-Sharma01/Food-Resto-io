import { Router } from "express";
import { createResto, deleteResto, getAllRestos, getRestoById, getRestosByCategory, getRestosByLocation, updateResto } from "../controllers/resto.controller.js";
import { verifyAdmin, verifyJWT, verifyOwner } from "../middlewares/auth.middleware.js";



const router = Router();


router.route("/restaurants")
.get(getAllRestos)
.post(verifyJWT, verifyAdmin, createResto);

router.route("/restaurants/:id")
.get(getRestoById)
.put(verifyJWT, verifyAdmin, verifyOwner, updateResto)
.delete(verifyJWT, verifyAdmin, verifyOwner, deleteResto);


router.route("/restaurants/category/:category")
.get(getRestosByCategory);

router.route("/restaurants/location/:location")
.get(getRestosByLocation);



export default Router;



