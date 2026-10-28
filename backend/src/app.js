import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import menuRouter from "./routes/menu.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";

const app = express();

// CORS configuration
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

// Parse request bodies
app.use(express.json({ limit: "16kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// Parse cookies
app.use(cookieParser());

// API routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/orders", orderRouter);

// Razorpay payment routes
app.use("/api/v1/payments", paymentRouter);

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
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

export { app };