import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Price must be a finite number",
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      validate: {
        validator: Number.isSafeInteger,
        message: "Quantity must be an integer",
      },
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0 &&
          items.length <= 50,
        message: "Order must contain 1 to 50 items",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Total amount must be finite",
      },
    },

    deliveryAddress: {
      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
        match: /^[1-9][0-9]{5}$/,
      },
    },

    // Order delivery status
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Razorpay order ID
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // Razorpay payment ID
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Razorpay payment signature
    razorpaySignature: {
      type: String,
      default: null,
      select: false,
    },

    // Payment completion time
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Faster user order history queries
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// Prevent two local orders from using the same Razorpay order ID
orderSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayOrderId: { $type: "string" },
    },
  }
);

// Prevent the same payment ID from being assigned to multiple orders
orderSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: "string" },
    },
  }
);

export const Order = mongoose.model(
  "Order",
  orderSchema
);