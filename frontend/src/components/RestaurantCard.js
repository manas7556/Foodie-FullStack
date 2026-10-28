
const RestaurantCard = ({ resData }) => {
  const {
    name,
    cuisines = [],
    rating,
    image,
    deliveryTime,
  } = resData || {};

  const numericRating = Number(rating);

  return (
    <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md">
      <div className="h-44 w-full overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name || "Restaurant"}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            🍽️
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-gray-900">
          {name || "Restaurant"}
        </h3>

        <p className="mt-1 truncate text-sm text-gray-500">
          {Array.isArray(cuisines) && cuisines.length > 0
            ? cuisines.join(", ")
            : "Cuisines unavailable"}
        </p>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-800">
            {rating != null && Number.isFinite(numericRating)
              ? `★ ${numericRating.toFixed(1)}`
              : "Not rated"}
          </span>

          <span className="text-gray-500">
            {deliveryTime != null
              ? `${deliveryTime} min`
              : "Time unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
