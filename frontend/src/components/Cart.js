import { useState, useContext, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE from "../utils/api";
import {
  clearCart,
  removeItem,
  addItem,
  MAX_QUANTITY_PER_ITEM,
  MAX_UNIQUE_ITEMS,
} from "../utils/cartSlice";
import UserContext from "../utils/UserContext";

const emptyAddress = {
  street: "",
  city: "",
  state: "",
  pincode: "",
};

const addressLimits = {
  street: 200,
  city: 100,
  state: 100,
  pincode: 6,
};

const isMongoObjectId = (value) =>
  typeof value === "string" &&
  /^[a-f\d]{24}$/i.test(value);

const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[data-razorpay-checkout="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(true),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const requestJSON = async (url, options = {}) => {
  const token = getAccessToken();

  if (!token) {
    const error = new Error(
      "Your session has expired. Please log in again."
    );

    error.status = 401;
    throw error;
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const error = new Error(
      `Unexpected server response (${response.status}). Check backend URL and routes.`
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const error = new Error(
      data.message || "Request failed."
    );

    error.status = response.status;
    throw error;
  }

  return data;
};

const Cart = () => {
  const cartItems = useSelector(
    (store) => store.cart.items
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loggedInUser } = useContext(UserContext);

  const [address, setAddress] = useState(() => ({
    ...emptyAddress,
    ...(location.state?.deliveryAddress || {}),
  }));

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mountedRef = useRef(false);
  const paymentInProgressRef = useRef(false);
  const checkoutRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price) * Number(item.quantity),
    0
  );

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    const updated =
      name === "pincode"
        ? value.replace(/\D/g, "").slice(0, 6)
        : value.slice(0, addressLimits[name]);

    setAddress((previous) => ({
      ...previous,
      [name]: updated,
    }));

    setError("");
  };

  const validateAddress = () => {
    for (const [field, maxLength] of Object.entries(
      addressLimits
    )) {
      const value = address[field];

      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return "Please enter your complete delivery address.";
      }

      if (value.trim().length > maxLength) {
        return `${field} is too long.`;
      }
    }

    if (
      !/^[1-9][0-9]{5}$/.test(
        address.pincode.trim()
      )
    ) {
      return "Please enter a valid 6-digit Indian PIN code.";
    }

    return "";
  };

  const redirectToLogin = () => {
    navigate("/login", {
      state: {
        from: "/cart",
        deliveryAddress: address,
      },
    });
  };

  const finishPaymentAttempt = () => {
    paymentInProgressRef.current = false;
    busyRef.current = false;

    if (mountedRef.current) {
      setLoading(false);
    }
  };

  const handleCheckoutError = (err) => {
    if (!mountedRef.current) return;

    if (err.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      redirectToLogin();
      return;
    }

    setError(
      err.message ||
        "Something went wrong. Please try again."
    );
  };

  const placeCODOrder = async (orderData) => {
    const data = await requestJSON(
      `${API_BASE}/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!mountedRef.current) return;

    dispatch(clearCart());

    setSuccess(
      `Order placed successfully! Order ID: ${data.data._id}`
    );

    setAddress({ ...emptyAddress });
  };

  const placeOnlineOrder = async (orderData) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded || !window.Razorpay) {
      throw new Error(
        "Unable to load Razorpay Checkout. Check your internet connection."
      );
    }

    const response = await requestJSON(
      `${API_BASE}/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    const {
      foodOrderId,
      razorpayOrderId,
      amount,
      currency,
      keyId,
    } = response.data || {};

    if (
      !foodOrderId ||
      !razorpayOrderId ||
      !keyId ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      currency !== "INR"
    ) {
      throw new Error(
        "The backend returned invalid payment details."
      );
    }

    const options = {
      key: keyId,
      amount,
      currency,
      name: "Food Delivery",
      description: "Food Order Payment",
      order_id: razorpayOrderId,

      handler: async (paymentResponse) => {
        paymentInProgressRef.current = true;

        if (!mountedRef.current) {
          finishPaymentAttempt();
          return;
        }

        try {
          setError("");
          setLoading(true);

          const verification = await requestJSON(
            `${API_BASE}/payments/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                foodOrderId,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }),
            }
          );

          if (!mountedRef.current) return;

          if (
            verification.data?.paymentStatus !==
            "paid"
          ) {
            throw new Error(
              "Payment verification is still pending."
            );
          }

          dispatch(clearCart());

          setAddress({ ...emptyAddress });

          setSuccess(
            `Payment successful! Your order ID is ${foodOrderId}.`
          );
        } catch (err) {
          if (mountedRef.current) {
            setError(
              "Payment verification could not be completed. " +
                "Please check My Orders before attempting another payment. " +
                (err.message || "")
            );
          }
        } finally {
          finishPaymentAttempt();
        }
      },

      modal: {
        ondismiss: () => {
          if (
            !mountedRef.current ||
            paymentInProgressRef.current
          ) {
            return;
          }

          finishPaymentAttempt();

          setError(
            "Checkout was closed. If you completed a payment, " +
              "check My Orders before trying again."
          );
        },

        confirm_close: true,
      },

      theme: {
        color: "#f97316",
      },
    };

    const checkout = new window.Razorpay(options);

    checkoutRef.current = checkout;

    checkout.on("payment.failed", (failure) => {
      if (!mountedRef.current) return;

      setError(
        failure.error?.description ||
          "Payment failed. Check My Orders before retrying."
      );

      finishPaymentAttempt();
    });

    checkout.open();
  };

  const handlePlaceOrder = async () => {
    if (busyRef.current) return;

    setError("");
    setSuccess("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!loggedInUser || !getAccessToken()) {
      redirectToLogin();
      return;
    }

    const addressError = validateAddress();

    if (addressError) {
      setError(addressError);
      return;
    }

    const restaurantId = cartItems[0]?.restaurant;

    if (
      !restaurantId ||
      cartItems.some(
        (item) =>
          String(item.restaurant) !==
          String(restaurantId)
      )
    ) {
      setError(
        "Cart items must belong to the same restaurant."
      );
      return;
    }

    if (!isMongoObjectId(String(restaurantId))) {
      setError(
        "Invalid restaurant ID. Please add items from a valid restaurant."
      );
      return;
    }

    if (cartItems.length > MAX_UNIQUE_ITEMS) {
      setError(
        `A maximum of ${MAX_UNIQUE_ITEMS} different items is allowed.`
      );
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !isMongoObjectId(String(item.id))
      )
    ) {
      setError(
        "Invalid menu item ID. Please add menu items stored in your MongoDB database."
      );
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > MAX_QUANTITY_PER_ITEM
      )
    ) {
      setError(
        `Each item must have a quantity between 1 and ${MAX_QUANTITY_PER_ITEM}.`
      );
      return;
    }

    const orderData = {
      restaurantId: String(restaurantId),

      items: cartItems.map((item) => ({
        menuItemId: String(item.id),
        quantity: item.quantity,
      })),

      deliveryAddress: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
    };

    busyRef.current = true;
    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        await placeCODOrder(orderData);
        finishPaymentAttempt();
      } else {
        await placeOnlineOrder(orderData);
      }
    } catch (err) {
      handleCheckoutError(err);
      finishPaymentAttempt();
    }
  };

  return (
    <div className="mx-auto my-8 max-w-3xl p-4">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Your Cart
      </h1>

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg bg-green-100 p-4 text-green-800"
        >
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg bg-red-100 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">
          Your cart is empty
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">
                    {item.name}
                  </h2>

                  <p className="text-gray-600">
                    ₹{item.price} × {item.quantity}
                  </p>

                  <p className="font-semibold">
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(removeItem(item.id))
                    }
                    disabled={loading}
                    aria-label={`Decrease ${item.name} quantity`}
                    className="rounded bg-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(addItem(item))
                    }
                    disabled={
                      loading ||
                      item.quantity >=
                        MAX_QUANTITY_PER_ITEM
                    }
                    aria-label={`Increase ${item.name} quantity`}
                    className="rounded bg-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-right text-xl font-bold">
            Total: ₹{totalAmount.toFixed(2)}
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(clearCart())
            }
            disabled={loading}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear Cart
          </button>

          <div className="mt-8 rounded-lg border p-5">
            <h2 className="mb-4 text-xl font-bold">
              Delivery Address
            </h2>

            {[
              "street",
              "city",
              "state",
              "pincode",
            ].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                placeholder={
                  field.charAt(0).toUpperCase() +
                  field.slice(1)
                }
                aria-label={field}
                value={address[field]}
                onChange={handleAddressChange}
                maxLength={addressLimits[field]}
                inputMode={
                  field === "pincode"
                    ? "numeric"
                    : "text"
                }
                disabled={loading}
                className="mb-3 w-full rounded border p-3"
              />
            ))}

            <div className="my-6">
              <h2 className="mb-3 text-lg font-bold">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={() =>
                      setPaymentMethod("COD")
                    }
                    disabled={loading}
                    className="h-4 w-4 accent-orange-500"
                  />

                  <span className="font-medium">
                    💵 Cash on Delivery
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={
                      paymentMethod === "ONLINE"
                    }
                    onChange={() =>
                      setPaymentMethod("ONLINE")
                    }
                    disabled={loading}
                    className="h-4 w-4 accent-orange-500"
                  />

                  <span className="font-medium">
                    💳 Pay Online (Razorpay)
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : paymentMethod === "COD"
                ? "Place Order"
                : "Proceed to Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;