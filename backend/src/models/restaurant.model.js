
import mongoose, { Schema } from "mongoose";

const restaurantSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        cuisines: {
            type: [String],
            default: []
        },

        image: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        deliveryTime: {
            type: Number,
            required: true,
            min: 1
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0
        },

        address: {
            street: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            pincode: {
                type: String,
                required: true
            }
        },

        isOpen: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Restaurant = mongoose.model(
    "Restaurant",
    restaurantSchema
);
