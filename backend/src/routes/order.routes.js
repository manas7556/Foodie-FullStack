import { Router } from "express";

import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Customer routes
router.post("/", placeOrder);

router.get("/my-orders", getMyOrders);

// Admin routes
router.get("/admin/all", verifyAdmin, getAllOrders);

router.patch(
  "/:orderId/status",
  verifyAdmin,
  updateOrderStatus
);

// Single customer order
router.get("/:orderId", getOrderById);

export default router;