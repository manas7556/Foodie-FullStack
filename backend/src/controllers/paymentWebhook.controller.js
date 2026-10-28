import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import userRouter from "./routes/user.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import menuRouter from "./routes/menu.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";

// Import Razorpay webhook controller
import { handlePaymentWebhook } from "./controllers/paymentWebhook.controller.js";

const app = express();

// ========================================
// 1. CORS CONFIGURATION
// ========================================

const allowedOrigin = process.env.CORS_ORIGIN?.trim();

if (!allowedOrigin || allowedOrigin === "*") {
  throw new Error(
    "CORS_ORIGIN must be set to your frontend URL, not '*'"
  );
}

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ========================================
// 2. RAZORPAY WEBHOOK
// IMPORTANT: Must be BEFORE express.json()
// ========================================

app.post(
  "/api/v1/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "256kb",
  }),
  handlePaymentWebhook
);

// ========================================
// 3. BODY PARSERS
// ========================================

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// ========================================
// 4. COOKIE PARSER
// ========================================

app.use(cookieParser());

// ========================================
// 5. API ROUTES
// ========================================

// Authentication
app.use("/api/v1/users", userRouter);

// Restaurants
app.use("/api/v1/restaurants", restaurantRouter);

// Restaurant menus
app.use("/api/v1/menu", menuRouter);

// Food orders (COD and order history)
app.use("/api/v1/orders", orderRouter);

// Razorpay online payments
app.use("/api/v1/payments", paymentRouter);

// ========================================
// 6. HANDLE UNKNOWN ROUTES
// ========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ========================================
// 7. GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("Backend error:", err);

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Something went wrong",
    errors: err.errors || [],
  });
});

// ========================================
// 8. EXPORT APP
// ========================================

export { app };