import { Router } from "express";
import { addMenuItem, fetchAllMenuItems, fetchMenuItem, removeMenuItem, updateMenuItem } from "../controllers/menuItem.controllers";


const router = Router();



router.route("/add-item/:restoId")
.post(addMenuItem);

router.route("/delete-item/:restoId/:itemId")
.delete(removeMenuItem);

router.route("/view-item/:itemId")
.get(fetchMenuItem);

router.route("/menu-item/update/:itemId")
.patch(updateMenuItem);

router.route("/menu-items/:restoId")
.get(fetchAllMenuItems);




export default router;
