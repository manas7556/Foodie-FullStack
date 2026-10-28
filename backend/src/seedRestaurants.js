
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./db/index.js";
import { Restaurant } from "./models/restaurant.model.js";
import { MenuItem } from "./models/menuItem.model.js";

dotenv.config({ path: "./.env" });

// These are sample/demo image URLs.
// You can replace them later with your own food photos.
const images = {
  biryani:
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=900&auto=format&fit=crop&q=85",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=85",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=85",
  dosa:
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900&auto=format&fit=crop&q=85",
  curry:
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900&auto=format&fit=crop&q=85",
  noodles:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&auto=format&fit=crop&q=85",
  rolls:
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&auto=format&fit=crop&q=85",
  momos:
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&auto=format&fit=crop&q=85",
  chicken:
    "https://images.unsplash.com/photo-1562967914-608f82629710?w=900&auto=format&fit=crop&q=85",
  sandwich:
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&auto=format&fit=crop&q=85",
  cake:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop&q=85",
  icecream:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&auto=format&fit=crop&q=85",
  thali:
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=85",
  seafood:
    "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&auto=format&fit=crop&q=85",
  salad:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=85",
};

// Each dish: [name, price, vegetarian]
// Sample prices in Indian rupees.
const restaurants = [
  {
    name: "Royal Biryani House",
    cuisines: ["Biryani", "Mughlai", "North Indian"],
    image: images.biryani,
    rating: 4.6,
    deliveryTime: 30,
    deliveryFee: 30,
    category: "Biryani",
    dishes: [
      ["Chicken Dum Biryani", 249, false],
      ["Hyderabadi Chicken Biryani", 279, false],
      ["Mutton Biryani", 349, false],
      ["Egg Biryani", 179, false],
      ["Veg Biryani", 169, true],
      ["Paneer Biryani", 219, true],
      ["Chicken 65", 199, false],
      ["Raita", 49, true],
    ],
  },
  {
    name: "Pizza Corner",
    cuisines: ["Pizza", "Italian", "Fast Food"],
    image: images.pizza,
    rating: 4.4,
    deliveryTime: 25,
    deliveryFee: 25,
    category: "Pizza",
    dishes: [
      ["Margherita Pizza", 199, true],
      ["Farmhouse Pizza", 299, true],
      ["Paneer Tikka Pizza", 329, true],
      ["Veggie Supreme Pizza", 279, true],
      ["Chicken Pepperoni Pizza", 349, false],
      ["BBQ Chicken Pizza", 369, false],
      ["Garlic Bread", 119, true],
      ["Cheese Garlic Bread", 149, true],
    ],
  },
  {
    name: "Burger Station",
    cuisines: ["Burgers", "American", "Fast Food"],
    image: images.burger,
    rating: 4.3,
    deliveryTime: 20,
    deliveryFee: 20,
    category: "Burgers",
    dishes: [
      ["Classic Veg Burger", 99, true],
      ["Cheese Veg Burger", 129, true],
      ["Paneer Burger", 169, true],
      ["Crispy Chicken Burger", 179, false],
      ["Double Chicken Burger", 249, false],
      ["Spicy Chicken Burger", 199, false],
      ["French Fries", 99, true],
      ["Peri Peri Fries", 129, true],
    ],
  },
  {
    name: "Dosa Delight",
    cuisines: ["South Indian", "Dosa", "Breakfast"],
    image: images.dosa,
    rating: 4.7,
    deliveryTime: 25,
    deliveryFee: 0,
    category: "South Indian",
    dishes: [
      ["Plain Dosa", 89, true],
      ["Masala Dosa", 119, true],
      ["Mysore Masala Dosa", 149, true],
      ["Rava Dosa", 139, true],
      ["Onion Uttapam", 129, true],
      ["Idli Sambar", 89, true],
      ["Medu Vada", 99, true],
      ["Pongal", 109, true],
    ],
  },
  {
    name: "Spice Kitchen",
    cuisines: ["North Indian", "Punjabi", "Curries"],
    image: images.curry,
    rating: 4.5,
    deliveryTime: 35,
    deliveryFee: 30,
    category: "Main Course",
    dishes: [
      ["Paneer Butter Masala", 239, true],
      ["Kadai Paneer", 229, true],
      ["Dal Makhani", 189, true],
      ["Chole Masala", 159, true],
      ["Butter Chicken", 299, false],
      ["Chicken Tikka Masala", 319, false],
      ["Butter Naan", 59, true],
      ["Jeera Rice", 139, true],
    ],
  },
  {
    name: "Wok Express",
    cuisines: ["Chinese", "Asian", "Noodles"],
    image: images.noodles,
    rating: 4.2,
    deliveryTime: 30,
    deliveryFee: 25,
    category: "Chinese",
    dishes: [
      ["Veg Hakka Noodles", 159, true],
      ["Chicken Hakka Noodles", 199, false],
      ["Schezwan Noodles", 179, true],
      ["Veg Fried Rice", 149, true],
      ["Chicken Fried Rice", 199, false],
      ["Chilli Paneer", 229, true],
      ["Chilli Chicken", 249, false],
      ["Veg Manchurian", 189, true],
    ],
  },
  {
    name: "Rolls & Wraps",
    cuisines: ["Rolls", "Wraps", "Fast Food"],
    image: images.rolls,
    rating: 4.3,
    deliveryTime: 20,
    deliveryFee: 20,
    category: "Rolls",
    dishes: [
      ["Veg Kathi Roll", 109, true],
      ["Paneer Kathi Roll", 149, true],
      ["Egg Roll", 119, false],
      ["Double Egg Roll", 149, false],
      ["Chicken Kathi Roll", 169, false],
      ["Chicken Tikka Roll", 199, false],
      ["Mushroom Roll", 159, true],
      ["Cheese Corn Roll", 149, true],
    ],
  },
  {
    name: "Momo Street",
    cuisines: ["Momos", "Tibetan", "Chinese"],
    image: images.momos,
    rating: 4.4,
    deliveryTime: 25,
    deliveryFee: 20,
    category: "Momos",
    dishes: [
      ["Veg Steamed Momos", 119, true],
      ["Chicken Steamed Momos", 149, false],
      ["Paneer Momos", 149, true],
      ["Veg Fried Momos", 139, true],
      ["Chicken Fried Momos", 169, false],
      ["Tandoori Chicken Momos", 199, false],
      ["Kurkure Veg Momos", 179, true],
      ["Momo Soup", 89, true],
    ],
  },
  {
    name: "Crispy Chicken Co.",
    cuisines: ["Fried Chicken", "American", "Fast Food"],
    image: images.chicken,
    rating: 4.5,
    deliveryTime: 30,
    deliveryFee: 35,
    category: "Fried Chicken",
    dishes: [
      ["Crispy Chicken Wings", 219, false],
      ["Chicken Popcorn", 169, false],
      ["Fried Chicken 2 Pieces", 249, false],
      ["Fried Chicken 4 Pieces", 449, false],
      ["Chicken Strips", 199, false],
      ["Spicy Chicken Bucket", 599, false],
      ["Chicken Nuggets", 159, false],
      ["Masala Fries", 109, true],
    ],
  },
  {
    name: "Sandwich Club",
    cuisines: ["Sandwiches", "Cafe", "Fast Food"],
    image: images.sandwich,
    rating: 4.1,
    deliveryTime: 20,
    deliveryFee: 15,
    category: "Sandwiches",
    dishes: [
      ["Veg Grilled Sandwich", 119, true],
      ["Cheese Sandwich", 139, true],
      ["Paneer Tikka Sandwich", 179, true],
      ["Corn Cheese Sandwich", 159, true],
      ["Chicken Club Sandwich", 219, false],
      ["Egg Sandwich", 149, false],
      ["Chicken Cheese Sandwich", 229, false],
      ["French Fries", 99, true],
    ],
  },
  {
    name: "The Cake Studio",
    cuisines: ["Bakery", "Cakes", "Desserts"],
    image: images.cake,
    rating: 4.6,
    deliveryTime: 30,
    deliveryFee: 30,
    category: "Desserts",
    dishes: [
      ["Chocolate Truffle Slice", 129, true],
      ["Red Velvet Pastry", 149, true],
      ["Black Forest Pastry", 119, true],
      ["Butterscotch Pastry", 109, true],
      ["Chocolate Brownie", 139, true],
      ["Blueberry Cheesecake", 199, true],
      ["Chocolate Muffin", 99, true],
      ["Vanilla Cupcake", 89, true],
    ],
  },
  {
    name: "Frozen Scoops",
    cuisines: ["Ice Cream", "Desserts", "Shakes"],
    image: images.icecream,
    rating: 4.7,
    deliveryTime: 20,
    deliveryFee: 20,
    category: "Ice Cream",
    dishes: [
      ["Vanilla Ice Cream", 99, true],
      ["Chocolate Ice Cream", 119, true],
      ["Butterscotch Ice Cream", 119, true],
      ["Mango Ice Cream", 109, true],
      ["Strawberry Sundae", 169, true],
      ["Chocolate Sundae", 189, true],
      ["Oreo Milkshake", 179, true],
      ["Cold Coffee", 149, true],
    ],
  },
  {
    name: "Homestyle Thali",
    cuisines: ["Thali", "North Indian", "Homestyle"],
    image: images.thali,
    rating: 4.5,
    deliveryTime: 35,
    deliveryFee: 0,
    category: "Thali",
    dishes: [
      ["Veg Mini Thali", 149, true],
      ["Veg Special Thali", 219, true],
      ["Paneer Thali", 249, true],
      ["Dal Rice Combo", 139, true],
      ["Rajma Rice Combo", 159, true],
      ["Chole Rice Combo", 159, true],
      ["Chicken Curry Thali", 289, false],
      ["Egg Curry Thali", 219, false],
    ],
  },
  {
    name: "Coastal Catch",
    cuisines: ["Seafood", "Coastal", "Indian"],
    image: images.seafood,
    rating: 4.4,
    deliveryTime: 40,
    deliveryFee: 40,
    category: "Seafood",
    dishes: [
      ["Fish Fry", 249, false],
      ["Fish Curry", 279, false],
      ["Prawn Masala", 349, false],
      ["Prawn Fry", 329, false],
      ["Fish Biryani", 299, false],
      ["Prawn Biryani", 369, false],
      ["Steamed Rice", 99, true],
      ["Coastal Fish Thali", 349, false],
    ],
  },
  {
    name: "Fresh Bowl Kitchen",
    cuisines: ["Healthy Food", "Salads", "Bowls"],
    image: images.salad,
    rating: 4.3,
    deliveryTime: 25,
    deliveryFee: 20,
    category: "Healthy Bowls",
    dishes: [
      ["Garden Fresh Salad", 159, true],
      ["Paneer Protein Bowl", 249, true],
      ["Grilled Chicken Bowl", 299, false],
      ["Quinoa Veg Bowl", 269, true],
      ["Chickpea Salad", 199, true],
      ["Fruit Bowl", 179, true],
      ["Brown Rice Veg Bowl", 229, true],
      ["Chicken Salad", 279, false],
    ],
  },
];

const seedRestaurants = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await connectDB();

    let restaurantsCreated = 0;
    let menuItemsCreated = 0;

    for (let index = 0; index < restaurants.length; index++) {
      const data = restaurants[index];

      // Unique marker for demo restaurants.
      const seedStreet = `Food Demo Street ${index + 1}`;

      // Find only restaurants created by this seed script.
      let restaurant = await Restaurant.findOne({
        name: data.name,
        "address.street": seedStreet,
        "address.city": "Bengaluru",
      });

      if (!restaurant) {
        restaurant = await Restaurant.create({
          name: data.name,
          description: `Fresh and delicious ${data.cuisines.join(
            ", "
          )} food.`,
          cuisines: data.cuisines,
          image: data.image,
          rating: data.rating,
          deliveryTime: data.deliveryTime,
          deliveryFee: data.deliveryFee,
          address: {
            street: seedStreet,
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
          },
          isOpen: true,
        });

        restaurantsCreated++;
      }

      for (const [name, price, isVeg] of data.dishes) {
        const existingItem = await MenuItem.findOne({
          restaurant: restaurant._id,
          name,
        });

        if (existingItem) {
          continue;
        }

        await MenuItem.create({
          restaurant: restaurant._id,
          name,
          description: `Freshly prepared ${name}.`,
          price,
          category: data.category,
          image: data.image,
          isVeg,
          isAvailable: true,
        });

        menuItemsCreated++;
      }

      console.log(`Ready: ${restaurant.name}`);
    }

    console.log("\nSeeding complete!");
    console.log(`New restaurants: ${restaurantsCreated}`);
    console.log(`New menu items: ${menuItemsCreated}`);
    console.log(`Sample restaurants processed: ${restaurants.length}`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedRestaurants();
