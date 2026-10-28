
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

// Key used to save cart data in localStorage
const CART_STORAGE_KEY = "swiggy_cart";

// Load previously saved cart items
const loadCartFromLocalStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    // Validate saved cart items
    const validItems = parsedCart.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        item.id.length > 0 &&
        typeof item.restaurant === "string" &&
        item.restaurant.length > 0 &&
        typeof item.name === "string" &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    });

    // Keep items from only one restaurant
    if (validItems.length === 0) {
      return [];
    }

    const restaurantId = validItems[0].restaurant;

    return validItems.filter(
      (item) => item.restaurant === restaurantId
    );
  } catch (error) {
    console.error("Failed to load saved cart:", error);
    return [];
  }
};

// Create Redux store
const appStore = configureStore({
  reducer: {
    cart: cartReducer,
  },

  preloadedState: {
    cart: {
      items: loadCartFromLocalStorage(),
    },
  },
});

// Save cart automatically whenever Redux state changes
appStore.subscribe(() => {
  try {
    const cartItems = appStore.getState().cart.items;

    if (cartItems.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    }
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
});

export default appStore;
