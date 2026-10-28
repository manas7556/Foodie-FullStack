
import mongoose from "mongoose";
import { MenuItem } from "../models/menuItem.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createMenuItem = asyncHandler(async (req, res) => {
    const {
        restaurant,
        name,
        description,
        price,
        category,
        image,
        isVeg,
        isAvailable
    } = req.body || {};

    if (
        !restaurant ||
        !name ||
        price === undefined ||
        price === null ||
        !category
    ) {
        throw new ApiError(400, "Required menu item details are missing");
    }

    if (!mongoose.isValidObjectId(restaurant)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const existingRestaurant = await Restaurant.findById(restaurant);

    if (!existingRestaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const menuItem = await MenuItem.create({
        restaurant,
        name,
        description,
        price,
        category,
        image,
        isVeg,
        isAvailable
    });

    return res.status(201).json(
        new ApiResponse(201, menuItem, "Menu item created successfully")
    );
});

const getRestaurantMenu = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const menuItems = await MenuItem.find({
        restaurant: restaurantId
    }).sort({ category: 1, name: 1 });

    return res.status(200).json(
        new ApiResponse(200, menuItems, "Restaurant menu fetched successfully")
    );
});

const updateMenuItem = asyncHandler(async (req, res) => {
    const { menuItemId } = req.params;

    if (!mongoose.isValidObjectId(menuItemId)) {
        throw new ApiError(400, "Invalid menu item ID");
    }

    const allowedFields = [
        "name",
        "description",
        "price",
        "category",
        "image",
        "isVeg",
        "isAvailable"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
        menuItemId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, menuItem, "Menu item updated successfully")
    );
});

const deleteMenuItem = asyncHandler(async (req, res) => {
    const { menuItemId } = req.params;

    if (!mongoose.isValidObjectId(menuItemId)) {
        throw new ApiError(400, "Invalid menu item ID");
    }

    const menuItem = await MenuItem.findByIdAndDelete(menuItemId);

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Menu item deleted successfully")
    );
});

export {
    createMenuItem,
    getRestaurantMenu,
    updateMenuItem,
    deleteMenuItem
};
