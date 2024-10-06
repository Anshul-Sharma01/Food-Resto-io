import { Router } from "express";
import { addMenuItem, fetchAllMenuItems, fetchMenuItem, removeMenuItem, toggleItemAvailability, updateMenuItem, updateMenuItemLogo } from "../controllers/menuItem.controllers";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();



router.route("/add-item/:restoId")
.post(upload.single("image"), addMenuItem);

router.route("/delete-item/:restoId/:itemId")
.delete(removeMenuItem);

router.route("/view-item/:itemId")
.get(fetchMenuItem);

router.route("/menu-item/update/:itemId")
.patch(updateMenuItem);

router.route("/menu-item/update-logo/:itemId")
.patch(upload.single('image'),updateMenuItemLogo);

router.route("/menu-items/:restoId")
.get(fetchAllMenuItems);

router.route("/menu-item/toggle/:itemId")
.get(toggleItemAvailability);



export default router;
