
import { Restaurant } from "../models/restaurant.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRestaurant = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        cuisines,
        image,
        rating,
        deliveryTime,
        deliveryFee,
        address,
        isOpen
    } = req.body;

    if (
        !name ||
        !deliveryTime ||
        !address?.street ||
        !address?.city ||
        !address?.state ||
        !address?.pincode
    ) {
        throw new ApiError(400, "Required restaurant details are missing");
    }

    const restaurant = await Restaurant.create({
        name,
        description,
        cuisines,
        image,
        rating,
        deliveryTime,
        deliveryFee,
        address,
        isOpen
    });

    return res.status(201).json(
        new ApiResponse(201, restaurant, "Restaurant created successfully")
    );
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, restaurants, "Restaurants fetched successfully")
    );
});

const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    return res.status(200).json(
        new ApiResponse(200, restaurant, "Restaurant fetched successfully")
    );
});

const updateRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.restaurantId,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    return res.status(200).json(
        new ApiResponse(200, restaurant, "Restaurant updated successfully")
    );
});

const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndDelete(
        req.params.restaurantId
    );

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Restaurant deleted successfully")
    );
});

export {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};
