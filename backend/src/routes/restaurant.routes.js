
import { Router } from "express";

import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
} from "../controllers/restaurant.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/")
    .get(getAllRestaurants)
    .post(verifyJWT, verifyAdmin, createRestaurant);

router.route("/:restaurantId")
    .get(getRestaurantById)
    .patch(verifyJWT, verifyAdmin, updateRestaurant)
    .delete(verifyJWT, verifyAdmin, deleteRestaurant);

export default router;
