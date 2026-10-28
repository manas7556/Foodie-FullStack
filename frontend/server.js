const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// --------------------------------------------------
// MENU DATA
// --------------------------------------------------

const menus = {
  "588619": {
    restaurant: {
      id: "588619",
      name: "Burger King",
      cuisines: ["Burgers", "American"],
      rating: 4.2,
    },

    categories: [
      {
        title: "Burgers",
        items: [
          {
            id: "burger-1",
            name: "Whopper",
            price: 199,
            description: "Classic Burger King Whopper",
          },
          {
            id: "burger-2",
            name: "Chicken Whopper",
            price: 219,
            description:
              "Crispy chicken burger with fresh vegetables",
          },
        ],
      },

      {
        title: "Sides",
        items: [
          {
            id: "side-1",
            name: "French Fries",
            price: 99,
            description: "Crispy golden french fries",
          },
          {
            id: "side-2",
            name: "Chicken Nuggets",
            price: 149,
            description: "Crispy chicken nuggets",
          },
        ],
      },

      {
        title: "Beverages",
        items: [
          {
            id: "drink-1",
            name: "Coke",
            price: 69,
            description: "Refreshing Coca Cola",
          },
        ],
      },
    ],
  },
};


// --------------------------------------------------
// HOME ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send("Server is running successfully");
});


// --------------------------------------------------
// MENU API
// --------------------------------------------------

app.get("/api/menu/:resId", (req, res) => {
  const { resId } = req.params;

  console.log("--------------------------------");
  console.log("Menu request received:", resId);

  // If we have a menu for this restaurant
  if (menus[resId]) {
    console.log("Menu found:", resId);

    return res.json(menus[resId]);
  }

  // ------------------------------------------------
  // TEMPORARY DEMO MENU
  // ------------------------------------------------
  // This prevents 404 when you click another
  // restaurant whose ID isn't in our test data.
  // ------------------------------------------------

  console.log(
    "No specific menu found. Sending demo menu."
  );

  const demoMenu = {
    restaurant: {
      id: resId,
      name: "Demo Restaurant",
      cuisines: ["Indian", "Chinese"],
      rating: 4.2,
    },

    categories: [
      {
        title: "Recommended",
        items: [
          {
            id: `${resId}-item-1`,
            name: "Paneer Butter Masala",
            price: 249,
            description:
              "Creamy paneer cooked in rich tomato gravy",
          },
          {
            id: `${resId}-item-2`,
            name: "Chicken Biryani",
            price: 299,
            description:
              "Aromatic basmati rice with chicken",
          },
        ],
      },

      {
        title: "Breads",
        items: [
          {
            id: `${resId}-item-3`,
            name: "Butter Naan",
            price: 49,
            description:
              "Soft naan topped with butter",
          },
          {
            id: `${resId}-item-4`,
            name: "Tandoori Roti",
            price: 35,
            description:
              "Traditional tandoori roti",
          },
        ],
      },

      {
        title: "Beverages",
        items: [
          {
            id: `${resId}-item-5`,
            name: "Cold Drink",
            price: 60,
            description:
              "Refreshing chilled soft drink",
          },
        ],
      },
    ],
  };

  return res.json(demoMenu);
});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log("--------------------------------");
  console.log(
    `Server running on http://localhost:${PORT}`
  );
  console.log("--------------------------------");
});