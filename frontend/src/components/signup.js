
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const destination =
    location.state?.from === "/cart" ? "/cart" : "/";

  const deliveryAddress = location.state?.deliveryAddress;

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginSuggestion, setShowLoginSuggestion] =
    useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setShowLoginSuggestion(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setShowLoginSuggestion(false);

    const fullName = formData.fullName.trim();
    const username = formData.username.trim().toLowerCase();
    const email = formData.email.trim().toLowerCase();

    if (
      !fullName ||
      !username ||
      !email ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            username,
            email,
            password: formData.password,
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
        if (response.status === 409) {
          setShowLoginSuggestion(true);

          throw new Error(
            "This email or username is already registered. Please log in instead."
          );
        }

        throw new Error(
          data.message || "Unable to create your account."
        );
      }

      // Registration successful.
      // Go to login and preserve checkout information.
      navigate("/login", {
        replace: true,
        state: {
          from: destination,
          deliveryAddress,
          message:
            "Account created successfully! Please log in.",
        },
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
        Create Account
      </h1>

      <p className="mb-6 text-center text-gray-500">
        Join us and start ordering delicious food
      </p>

      {destination === "/cart" && (
        <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
          Create your account to continue checkout.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          {showLoginSuggestion && (
            <Link
              to="/login"
              state={{
                from: destination,
                deliveryAddress,
              }}
              className="mt-2 inline-block font-semibold text-orange-600 hover:underline"
            >
              Go to Login
            </Link>
          )}
        </div>
      )}

      <form
        onSubmit={handleSignup}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="signup-fullName"
            className="mb-2 block font-medium"
          >
            Full Name
          </label>

          <input
            id="signup-fullName"
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="signup-username"
            className="mb-2 block font-medium"
          >
            Username
          </label>

          <input
            id="signup-username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-2 block font-medium"
          >
            Email Address
          </label>

          <input
            id="signup-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-2 block font-medium"
          >
            Password
          </label>

          <input
            id="signup-password"
            type="password"
            name="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="signup-confirmPassword"
            className="mb-2 block font-medium"
          >
            Confirm Password
          </label>

          <input
            id="signup-confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 p-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          state={{
            from: destination,
            deliveryAddress,
          }}
          className="font-semibold text-orange-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
