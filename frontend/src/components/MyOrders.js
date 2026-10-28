
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../utils/UserContext";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/orders/my-orders",
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch orders"
          );
        }

        setOrders(data.data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [loggedInUser, navigate]);

  if (loading) {
    return <p className="mt-10 text-center">Loading orders...</p>;
  }

  if (error) {
    return (
      <p className="mt-10 text-center text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-4xl p-4">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">
          You haven't placed any orders yet.
        </p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-lg border bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {order.restaurant?.name ||
                      "Restaurant"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Order #{order._id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <span className="h-fit rounded bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                {order.items.map((item) => (
                  <p key={item.menuItem}>
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold">
                  ₹{order.totalAmount}
                </span>

                <Link
                  to={`/orders/${order._id}`}
                  className="rounded bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
