
import { createSlice } from "@reduxjs/toolkit";

export const MAX_QUANTITY_PER_ITEM = 20;
export const MAX_UNIQUE_ITEMS = 50;

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    items: [],
  },

  reducers: {
    addItem: (state, action) => {
      const item = action.payload;

      if (!item || typeof item !== "object") {
        return;
      }

      const itemId = String(item._id || item.id || "");

      const restaurantId = String(
        item.restaurant?._id || item.restaurant || ""
      );

      if (!itemId || !restaurantId) {
        return;
      }

      // Allow items from only one restaurant.
      if (
        state.items.length > 0 &&
        String(state.items[0].restaurant) !== restaurantId
      ) {
        return;
      }

      const existingItem = state.items.find(
        (cartItem) => cartItem.id === itemId
      );

      if (existingItem) {
        // Never exceed backend quantity limit.
        if (existingItem.quantity >= MAX_QUANTITY_PER_ITEM) {
          return;
        }

        existingItem.quantity += 1;
      } else {
        // Match the backend maximum item count.
        if (state.items.length >= MAX_UNIQUE_ITEMS) {
          return;
        }

        state.items.push({
          id: itemId,
          restaurant: restaurantId,
          name: item.name,
          price: item.price,
          description: item.description || "",
          quantity: 1,
        });
      }
    },

    removeItem: (state, action) => {
      const itemId = String(action.payload);

      const existingItem = state.items.find(
        (item) => item.id === itemId
      );

      if (!existingItem) {
        return;
      }

      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        state.items = state.items.filter(
          (item) => item.id !== itemId
        );
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
