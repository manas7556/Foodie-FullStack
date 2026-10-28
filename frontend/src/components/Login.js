
import { useState, useContext } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import UserContext from "../utils/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserInfo } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignupSuggestion, setShowSignupSuggestion] =
    useState(false);

  // Remember whether the customer came from checkout.
  const destination =
    location.state?.from === "/cart" ? "/cart" : "/";

  const deliveryAddress = location.state?.deliveryAddress;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setShowSignupSuggestion(false);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Invalid server response. Please check your backend."
        );
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        if (response.status === 401) {
          setShowSignupSuggestion(true);
          throw new Error(
            "Account not found or incorrect password. If you're a new customer, please sign up first."
          );
        }

        throw new Error(
          data.message || "Login failed. Please try again."
        );
      }

      if (!data?.data?.user) {
        throw new Error(
          "User information is missing from the login response."
        );
      }

      // Store authenticated customer in context.
      setUserInfo(data.data.user);

      setPassword("");

      // Return to checkout if the customer came from Cart.
      navigate(destination, {
        replace: true,
        state:
          destination === "/cart"
            ? { deliveryAddress }
            : null,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-md">
      <h1 className="mb-2 text-center text-3xl font-bold">
        Welcome Back!
      </h1>

      <p className="mb-6 text-center text-gray-500">
        Login to continue ordering your favourite food
      </p>

      {location.state?.message && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {location.state.message}
        </div>
      )}

      {destination === "/cart" && (
        <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
          Please log in or create an account to complete
          your order.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block font-medium"
          >
            Email Address
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setShowSignupSuggestion(false);
            }}
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block font-medium"
          >
            Password
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setShowSignupSuggestion(false);
            }}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            {showSignupSuggestion && (
              <Link
                to="/signup"
                state={{
                  from: destination,
                  deliveryAddress,
                }}
                className="mt-3 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Create an Account
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 p-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          state={{
            from: destination,
            deliveryAddress,
          }}
          className="font-semibold text-orange-600 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
