
import RestaurantCard from "./RestaurantCard";
import { useState, useEffect, useMemo } from "react";
import Shimmer from "./Shimmer";
import { Link } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";

const Body = () => {
  const [listOfRestaurants, setListOfRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const onlineStatus = useOnlineStatus();

  useEffect(() => {
    const controller = new AbortController();

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8000/api/v1/restaurants",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch restaurants: ${response.status}`
          );
        }

        const json = await response.json();

        if (!Array.isArray(json.data)) {
          throw new Error("Invalid restaurant API response");
        }

        if (!controller.signal.aborted) {
          setListOfRestaurants(json.data);
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error("Restaurant fetch error:", err);
          setError(err.message || "Failed to load restaurants");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRestaurants();

    return () => controller.abort();
  }, [retryCount]);

  const filteredRestaurants = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return listOfRestaurants.filter((res) => {
      const name = String(res.name || "").toLowerCase();

      const cuisines = Array.isArray(res.cuisines)
        ? res.cuisines.join(" ").toLowerCase()
        : "";

      const matchesSearch =
        name.includes(search) || cuisines.includes(search);

      const matchesRating =
        !topRatedOnly || Number(res.rating) > 4.2;

      return matchesSearch && matchesRating;
    });
  }, [listOfRestaurants, searchText, topRatedOnly]);

  const handleShowAll = () => {
    setSearchText("");
    setTopRatedOnly(false);
  };

  if (onlineStatus === false) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-4 text-center">
        <h2 className="text-2xl font-bold">
          You're Offline!
        </h2>
        <p className="mt-2 text-gray-500">
          Please check your internet connection.
        </p>
      </div>
    );
  }

  if (loading) {
    return <Shimmer />;
  }

  if (error) {
    return (
      <div className="mx-auto mt-16 max-w-3xl px-4 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Unable to load restaurants
        </h2>

        <p className="mt-2 text-gray-600">{error}</p>

        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="mt-5 rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Restaurants
      </h1>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search restaurants..."
          aria-label="Search restaurants"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 sm:w-80"
        />

        <button
          type="button"
          onClick={() => setTopRatedOnly((value) => !value)}
          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            topRatedOnly
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Top Rated Restaurants
        </button>

        <button
          type="button"
          onClick={handleShowAll}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Show All
        </button>
      </div>

      {listOfRestaurants.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No restaurants available yet.
        </p>
      ) : filteredRestaurants.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No matching restaurants found.
        </p>
      ) : (
        <>
          <p className="mb-5 text-sm text-gray-500">
            {filteredRestaurants.length} restaurants found
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((res) => (
              <Link
                key={res._id}
                to={`/restaurants/${res._id}`}
                className="block h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <RestaurantCard resData={res} />
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Body;
