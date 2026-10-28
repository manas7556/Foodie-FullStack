
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { addItem } from "../utils/cartSlice";

const API_BASE = "http://localhost:8000/api/v1";

const MenuShimmer = () => (
  <main
    className="mx-auto my-6 w-full max-w-4xl animate-pulse px-4"
    role="status"
    aria-label="Loading restaurant menu"
  >
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="h-8 w-2/3 rounded bg-gray-200" />
      <div className="mt-5 h-5 w-1/2 rounded bg-gray-200" />
      <div className="mt-4 h-5 w-1/3 rounded bg-gray-200" />
    </div>

    {[1, 2, 3].map((category) => (
      <div
        key={category}
        className="mb-4 rounded-xl border border-gray-100 bg-white p-5"
      >
        <div className="h-6 w-1/3 rounded bg-gray-200" />

        {category === 1 &&
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="mt-6 flex justify-between gap-4 border-t border-gray-100 pt-5"
            >
              <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
              <div className="h-24 w-24 rounded-xl bg-gray-200 sm:h-32 sm:w-32" />
            </div>
          ))}
      </div>
    ))}

    <span className="sr-only">Loading menu...</span>
  </main>
);

const RestaurantMenu = () => {
  const { resId } = useParams();
  const dispatch = useDispatch();

  const cartItems = useSelector((store) => store.cart.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity ?? 1),
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * (item.quantity ?? 1),
    0
  );

  const cartRestaurantId = cartItems[0]?.restaurant;
  const activeCartRestaurantId = String(
    cartRestaurantId?._id || cartRestaurantId || ""
  );

  const isDifferentRestaurant =
    cartItems.length > 0 &&
    activeCartRestaurantId !== String(resId);

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [openCategory, setOpenCategory] = useState(0);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError("");
        setRestaurant(null);
        setCategories([]);

        const [restaurantResponse, menuResponse] =
          await Promise.all([
            fetch(`${API_BASE}/restaurants/${resId}`, {
              signal: controller.signal,
            }),
            fetch(`${API_BASE}/menu/restaurant/${resId}`, {
              signal: controller.signal,
            }),
          ]);

        if (!restaurantResponse.ok) {
          throw new Error(
            `Restaurant request failed: ${restaurantResponse.status}`
          );
        }

        if (!menuResponse.ok) {
          throw new Error(
            `Menu request failed: ${menuResponse.status}`
          );
        }

        const restaurantData = await restaurantResponse.json();
        const menuData = await menuResponse.json();

        const restaurantInfo = restaurantData.data;
        const menuItems = menuData.data;

        if (!restaurantInfo || !Array.isArray(menuItems)) {
          throw new Error("Invalid API response");
        }

        const groupedCategories = menuItems.reduce(
          (acc, item) => {
            const categoryName = item.category || "Other";

            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }

            acc[categoryName].push({
              ...item,
              id: item._id,
            });

            return acc;
          },
          {}
        );

        const formattedCategories = Object.entries(
          groupedCategories
        ).map(([title, items]) => ({
          title,
          items,
        }));

        if (!controller.signal.aborted) {
          setRestaurant(restaurantInfo);
          setCategories(formattedCategories);
          setOpenCategory(0);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("MENU ERROR:", err);

          if (!controller.signal.aborted) {
            setError(err.message || "Unable to fetch menu");
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMenu();

    return () => controller.abort();
  }, [resId, retryCount]);

  useEffect(() => {
    setCartMessage("");
  }, [resId]);

  const toggleCategory = (index) => {
    setOpenCategory((current) =>
      current === index ? -1 : index
    );
  };

  const handleAddItem = (item) => {
    setCartMessage("");

    if (isDifferentRestaurant) {
      setCartMessage(
        "Your cart contains items from another restaurant. Clear your cart before adding food from this restaurant."
      );
      return;
    }

    const existingItem = cartItems.find(
      (cartItem) =>
        String(cartItem.id || cartItem._id) === String(item._id)
    );

    if (existingItem && (existingItem.quantity ?? 1) >= 20) {
      setCartMessage("Maximum 20 quantities allowed per item.");
      return;
    }

    if (!existingItem && cartItems.length >= 50) {
      setCartMessage("Maximum 50 different items allowed.");
      return;
    }

    dispatch(addItem(item));
  };

  if (loading) {
    return <MenuShimmer />;
  }

  if (error) {
    return (
      <main className="mx-auto mt-10 max-w-3xl px-4">
        <div className="rounded-xl bg-red-50 p-6 text-red-700">
          <h2 className="text-xl font-bold">
            Unable to load restaurant menu
          </h2>

          <p className="mt-2 text-sm">{error}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-5 rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <p className="mt-10 text-center text-gray-500">
        No restaurant available
      </p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-orange-600">
          Restaurants
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-800">
          {restaurant.name}
        </span>
      </div>

      {/* Restaurant information */}
      <section className="mb-9 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {restaurant.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white">
            ★ {restaurant.rating ?? "N/A"}
          </span>

          <span className="text-sm font-medium text-gray-700">
            {restaurant.deliveryTime} min delivery
          </span>

          {restaurant.isOpen === false && (
            <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
              Currently Closed
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-500">
          {restaurant.cuisines?.join(", ") ||
            "Delicious food delivered to you"}
        </p>

        {restaurant.description && (
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {restaurant.description}
          </p>
        )}

        {restaurant.deliveryFee != null && (
          <div className="mt-5 border-t border-dashed border-gray-200 pt-4 text-sm text-gray-600">
            Delivery fee:{" "}
            <span className="font-semibold text-gray-900">
              ₹{restaurant.deliveryFee}
            </span>
          </div>
        )}
      </section>

      {/* Menu heading */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Explore Menu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose your favourites
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
          {categories.reduce(
            (total, category) => total + category.items.length,
            0
          )}{" "}
          items
        </span>
      </div>

      {/* Cart warning */}
      {cartMessage && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800"
        >
          {cartMessage}
          <Link
            to="/cart"
            className="ml-2 font-bold underline"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          No menu items available
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => {
            const isOpen = openCategory === index;

            return (
              <section
                key={category.title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-5 text-left transition hover:bg-gray-50 sm:px-6"
                >
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    {category.title} ({category.items.length})
                  </span>

                  <span
                    aria-hidden="true"
                    className={`text-sm text-gray-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {category.items.map((item) => (
                      <article
                        key={item._id}
                        className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-5 last:border-b-0 sm:gap-6 sm:px-6 sm:py-6"
                      >
                        {/* Item details */}
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              item.isVeg
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${
                                item.isVeg
                                  ? "bg-green-600"
                                  : "bg-red-500"
                              }`}
                            />
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </span>

                          <h3 className="mt-2 text-base font-bold leading-6 text-gray-900">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            ₹{item.price}
                          </p>

                          {item.description && (
                            <p className="mt-3 text-sm leading-6 text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Image and add button */}
                        <div className="flex w-24 shrink-0 flex-col items-center sm:w-36">
                          <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-36">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                🍽️
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={
                              !item.isAvailable ||
                              restaurant.isOpen === false
                            }
                            onClick={() => handleAddItem(item)}
                            className="relative -mt-3 w-20 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-extrabold text-green-700 shadow-md transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-28 sm:text-sm"
                          >
                            {!item.isAvailable
                              ? "Unavailable"
                              : restaurant.isOpen === false
                              ? "Closed"
                              : "ADD +"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl">
          <Link
            to="/cart"
            className="flex items-center justify-between gap-3 rounded-xl bg-green-700 px-4 py-4 text-white shadow-xl transition hover:bg-green-800 sm:px-6"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {cartCount} {cartCount === 1 ? "item" : "items"} added
              </p>
              <p className="mt-0.5 text-xs text-green-100">
                ₹{cartTotal.toFixed(2)}
                {isDifferentRestaurant
                  ? " · From another restaurant"
                  : " · Item subtotal"}
              </p>
            </div>

            <span className="shrink-0 text-sm font-bold">
              View Cart →
            </span>
          </Link>
        </div>
      )}
    </main>
  );
};

export default RestaurantMenu;
