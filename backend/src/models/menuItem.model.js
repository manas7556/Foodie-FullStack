
import mongoose, { Schema } from "mongoose";

const menuItemSchema = new Schema(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
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

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    image: {
      type: String,
      default: "",
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model(
  "MenuItem",
  menuItemSchema
);
