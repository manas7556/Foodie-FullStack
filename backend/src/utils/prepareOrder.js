import mongoose from "mongoose";

import { Restaurant } from "../models/restaurant.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { ApiError } from "./ApiError.js";

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_UNIQUE_ITEMS = 50;

const validateDeliveryAddress = (address) => {
  if (
    !address ||
    typeof address !== "object" ||
    Array.isArray(address)
  ) {
    throw new ApiError(400, "Complete delivery address is required");
  }

  const limits = {
    street: 200,
    city: 100,
    state: 100,
    pincode: 6,
  };

  const cleanedAddress = {};

  for (const [field, maxLength] of Object.entries(limits)) {
    const value = address[field];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.trim().length > maxLength
    ) {
      throw new ApiError(
        400,
        `Invalid delivery address field: ${field}`
      );
    }

    cleanedAddress[field] = value.trim();
  }

  if (!/^[1-9][0-9]{5}$/.test(cleanedAddress.pincode)) {
    throw new ApiError(400, "Please enter a valid 6-digit Indian PIN code");
  }

  return cleanedAddress;
};

const prepareOrder = async ({
  restaurantId,
  items,
  deliveryAddress,
}) => {
  // Validate restaurant ID
  if (!mongoose.isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Validate cart
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart cannot be empty");
  }

  if (items.length > MAX_UNIQUE_ITEMS) {
    throw new ApiError(400, "Too many items in a single order");
  }

  // Validate address
  const cleanedAddress = validateDeliveryAddress(deliveryAddress);

  // Find restaurant
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (!restaurant.isOpen) {
    throw new ApiError(
      400,
      "This restaurant is currently closed"
    );
  }

  // Combine duplicate items and validate quantities
  const quantities = new Map();

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !mongoose.isValidObjectId(item.menuItemId)
    ) {
      throw new ApiError(400, "Invalid menu item");
    }

    const menuItemId = String(item.menuItemId);
    const quantity = item.quantity;

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      throw new ApiError(
        400,
        `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}`
      );
    }

    const combinedQuantity =
      (quantities.get(menuItemId) || 0) + quantity;

    if (combinedQuantity > MAX_QUANTITY_PER_ITEM) {
      throw new ApiError(
        400,
        `Maximum ${MAX_QUANTITY_PER_ITEM} units allowed per item`
      );
    }

    quantities.set(menuItemId, combinedQuantity);
  }

  // Fetch actual menu items from MongoDB
  const menuItems = await MenuItem.find({
    _id: { $in: [...quantities.keys()] },
    restaurant: restaurant._id,
    isAvailable: true,
  });

  if (menuItems.length !== quantities.size) {
    throw new ApiError(
      400,
      "Some items are unavailable or belong to another restaurant"
    );
  }

  let totalAmount = 0;

  const orderItems = menuItems.map((item) => {
    const quantity = quantities.get(item._id.toString());
    const price = item.price;

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new ApiError(400, "Invalid menu item price");
    }

    const itemTotal = price * quantity;

    if (!Number.isFinite(itemTotal)) {
      throw new ApiError(400, "Invalid order total");
    }

    totalAmount += itemTotal;

    return {
      menuItem: item._id,
      name: item.name,
      price,
      quantity,
    };
  });

  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    throw new ApiError(400, "Invalid total amount");
  }

  totalAmount =
    Math.round((totalAmount + Number.EPSILON) * 100) / 100;

  return {
    restaurant: restaurant._id,
    items: orderItems,
    deliveryAddress: cleanedAddress,
    totalAmount,
  };
};

export { prepareOrder };