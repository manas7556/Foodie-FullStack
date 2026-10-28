
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const OrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8000/api/v1/orders/${orderId}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch order"
          );
        }

        setOrder(data.data);
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

    fetchOrder();

    return () => controller.abort();
  }, [orderId]);

  if (loading) {
    return (
      <p className="mt-10 text-center">
        Loading order details...
      </p>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/orders" className="text-orange-600">
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="mt-10 text-center">Order not found</p>;
  }

  const address = order.deliveryAddress || {};

  return (
    <div className="mx-auto my-8 max-w-3xl p-4">
      <Link
        to="/orders"
        className="text-orange-600 hover:underline"
      >
        ← Back to My Orders
      </Link>

      <h1 className="mt-5 text-3xl font-bold">
        Order Details
      </h1>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          {order.restaurant?.name || "Restaurant"}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Order ID: {order._id}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Placed on:{" "}
          {new Date(order.createdAt).toLocaleString("en-IN")}
        </p>

        <div className="mt-5">
          <span className="rounded bg-orange-100 px-3 py-1 font-medium text-orange-700">
            Status: {order.status}
          </span>
        </div>

        <hr className="my-6" />

        <h3 className="mb-4 text-lg font-bold">
          Ordered Items
        </h3>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={item.menuItem || index}
              className="flex justify-between"
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <hr className="my-6" />

        <div className="flex justify-between text-xl font-bold">
          <span>Total Amount</span>
          <span>₹{order.totalAmount}</span>
        </div>

        <hr className="my-6" />

        <h3 className="text-lg font-bold">
          Delivery Address
        </h3>

        <p className="mt-2 text-gray-700">
          {address.street}
          <br />
          {address.city}, {address.state}
          <br />
          PIN: {address.pincode}
        </p>

        <hr className="my-6" />

        <h3 className="text-lg font-bold">
          Payment Information
        </h3>

        <p className="mt-2">
          Payment Method:{" "}
          <strong>
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod}
          </strong>
        </p>

        <p className="mt-2">
          Payment Status:{" "}
          <strong>{order.paymentStatus}</strong>
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
