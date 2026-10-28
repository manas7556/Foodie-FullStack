import crypto from "node:crypto";
import mongoose from "mongoose";

import razorpay from "../utils/razorpay.js";
import { prepareOrder } from "../utils/prepareOrder.js";
import { Order } from "../models/order.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ========================================
// CREATE RAZORPAY ORDER
// ========================================

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;

  // Reuse the same validation as COD checkout
  const orderData = await prepareOrder({
    restaurantId,
    items,
    deliveryAddress,
  });

  // Razorpay expects the amount in paise
  const amountInPaise = Math.round(orderData.totalAmount * 100);

  if (
    !Number.isSafeInteger(amountInPaise) ||
    amountInPaise < 100
  ) {
    throw new ApiError(
      400,
      "Online payment amount must be at least ₹1"
    );
  }

  // Create a pending food order in MongoDB
  const foodOrder = await Order.create({
    user: req.user._id,
    restaurant: orderData.restaurant,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    deliveryAddress: orderData.deliveryAddress,
    paymentMethod: "ONLINE",
    paymentStatus: "pending",
    status: "placed",
  });

  let razorpayOrder;

  try {
    // Create an order on Razorpay
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: foodOrder._id.toString(),
      notes: {
        foodOrderId: foodOrder._id.toString(),
      },
    });
  } catch (error) {
    // Mark the food order as failed if Razorpay order creation fails
    await Order.updateOne(
      {
        _id: foodOrder._id,
        paymentStatus: "pending",
      },
      {
        $set: { paymentStatus: "failed" },
      }
    );

    throw new ApiError(
      502,
      "Unable to initialize online payment. Please try again."
    );
  }

  // Save the Razorpay order ID in MongoDB
  foodOrder.razorpayOrderId = razorpayOrder.id;
  await foodOrder.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        foodOrderId: foodOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully"
    )
  );
});

// ========================================
// VERIFY RAZORPAY PAYMENT
// ========================================

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    foodOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !mongoose.isValidObjectId(foodOrderId) ||
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    throw new ApiError(400, "Invalid payment verification details");
  }

  // Find only an order belonging to the logged-in customer
  const foodOrder = await Order.findOne({
    _id: foodOrderId,
    user: req.user._id,
    paymentMethod: "ONLINE",
    razorpayOrderId: razorpay_order_id,
  });

  if (!foodOrder) {
    throw new ApiError(404, "Payment order not found");
  }

  // Generate the expected signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(
      `${foodOrder.razorpayOrderId}|${razorpay_payment_id}`
    )
    .digest("hex");

  // Compare signatures safely
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(razorpay_signature, "hex");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new ApiError(400, "Payment signature verification failed");
  }

  // Fetch payment status directly from Razorpay
  let payment;

  try {
    payment = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (error) {
    throw new ApiError(
      502,
      "Unable to confirm payment with Razorpay"
    );
  }

  const expectedAmount = Math.round(foodOrder.totalAmount * 100);

  if (
    payment.order_id !== foodOrder.razorpayOrderId ||
    payment.status !== "captured" ||
    payment.currency !== "INR" ||
    payment.amount !== expectedAmount
  ) {
    throw new ApiError(
      400,
      "Payment has not been captured for the correct order and amount"
    );
  }

  // Prevent duplicate payment confirmation
  if (foodOrder.paymentStatus === "paid") {
    if (foodOrder.razorpayPaymentId !== razorpay_payment_id) {
      throw new ApiError(
        409,
        "This order has already been paid using another payment"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { foodOrderId: foodOrder._id, paymentStatus: "paid" },
        "Payment already verified"
      )
    );
  }

  // Atomically mark the pending order as paid
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: foodOrder._id,
      user: req.user._id,
      paymentMethod: "ONLINE",
      paymentStatus: "pending",
      razorpayOrderId: razorpay_order_id,
    },
    {
      $set: {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updatedOrder) {
    throw new ApiError(
      409,
      "Order payment state has changed. Please refresh your order."
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        foodOrderId: updatedOrder._id,
        paymentStatus: updatedOrder.paymentStatus,
      },
      "Payment verified successfully"
    )
  );
});

export { createPaymentOrder, verifyPayment };