import mongoose from "mongoose";

import { Order } from "../models/order.model.js";
import { prepareOrder } from "../utils/prepareOrder.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// =====================================
// PLACE ORDER (COD)
// =====================================

const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;

  const orderData = await prepareOrder({
    restaurantId,
    items,
    deliveryAddress,
  });

  const order = await Order.create({
    user: req.user._id,
    restaurant: orderData.restaurant,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    deliveryAddress: orderData.deliveryAddress,
    paymentMethod: "COD",
    paymentStatus: "pending",
    status: "placed",
  });

  return res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully")
  );
});

// =====================================
// GET MY ORDERS
// =====================================

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("restaurant", "name image")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, orders, "Orders fetched successfully")
  );
});

// =====================================
// GET ORDER BY ID
// =====================================

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  }).populate("restaurant", "name image");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res.status(200).json(
    new ApiResponse(200, order, "Order fetched successfully")
  );
});

// =====================================
// GET ALL ORDERS (ADMIN)
// =====================================

const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(req.query.limit, 10) || 10
    )
  );

  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find()
      .populate("user", "fullName email username")
      .populate("restaurant", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      },
      "All orders fetched successfully"
    )
  );
});

// =====================================
// UPDATE ORDER STATUS (ADMIN)
// =====================================

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const allowedTransitions = {
    placed: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  if (
    typeof status !== "string" ||
    !Object.prototype.hasOwnProperty.call(allowedTransitions, status)
  ) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const allowed = allowedTransitions[order.status] || [];

  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change order status from ${order.status} to ${status}`
    );
  }

  // Do not cancel paid online orders without refund handling.
  if (
    status === "cancelled" &&
    order.paymentMethod === "ONLINE" &&
    order.paymentStatus === "paid"
  ) {
    throw new ApiError(
      400,
      "Paid online orders require a separate refund process"
    );
  }

  // Do not process unpaid online orders.
  if (
    status !== "cancelled" &&
    order.paymentMethod === "ONLINE" &&
    order.paymentStatus !== "paid"
  ) {
    throw new ApiError(
      400,
      "Online payment must be completed before processing the order"
    );
  }

  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    },
    {
      $set: { status },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!updatedOrder) {
    throw new ApiError(
      409,
      "Order status or payment state changed. Please try again."
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedOrder,
      "Order status updated successfully"
    )
  );
});

// =====================================
// EXPORT ALL CONTROLLERS
// =====================================

export {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};