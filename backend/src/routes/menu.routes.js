
import { Router } from "express";

import {
    createMenuItem,
    getRestaurantMenu,
    updateMenuItem,
    deleteMenuItem
} from "../controllers/menu.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/")
    .post(verifyJWT, verifyAdmin, createMenuItem);

router.route("/restaurant/:restaurantId")
    .get(getRestaurantMenu);

router.route("/:menuItemId")
    .patch(verifyJWT, verifyAdmin, updateMenuItem)
    .delete(verifyJWT, verifyAdmin, deleteMenuItem);

export default router;
