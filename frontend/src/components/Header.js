
import { memo, useContext, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import useOnlineStatus from "../utils/useOnlineStatus";
import UserContext from "../utils/UserContext";

const Header = () => {
  const {
    loggedInUser,
    setUserInfo,
    authLoading,
  } = useContext(UserContext);

  const onlineStatus = useOnlineStatus();
  const navigate = useNavigate();

  const cartCount = useSelector((store) =>
    store.cart.items.reduce(
      (total, item) => total + (item.quantity ?? 1),
      0
    )
  );

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleAuth = async () => {
    if (authLoading || loggingOut) return;

    closeMobileMenu();

    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      setUserInfo(null);
      navigate("/");
    } catch (error) {
      setLogoutError(
        error.message || "Unable to log out."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-orange-50 text-orange-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
    }`;

  const userName =
    loggedInUser?.fullName || "Guest";

  const userInitial =
    userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-2xl text-white shadow-sm">
            🍴
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Foodie<span className="text-orange-500">.</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-gray-400">
              FRESH FOOD, FAST DELIVERY
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>

          <NavLink to="/grocery" className={navLinkClass}>
            Grocery
          </NavLink>

          {!authLoading && loggedInUser && (
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <span
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500"
            title={onlineStatus ? "Online" : "Offline"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                onlineStatus
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            {onlineStatus ? "Online" : "Offline"}
          </span>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <span className="text-xl" aria-hidden="true">
              🛒
            </span>
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-7 w-px bg-gray-200" />

          <div className="flex max-w-40 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
              {authLoading ? "…" : userInitial}
            </div>

            <span
              className="max-w-24 truncate text-sm font-medium text-gray-700"
              title={authLoading ? "Loading" : userName}
            >
              {authLoading ? "..." : userName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAuth}
            disabled={authLoading || loggingOut}
            className="min-w-20 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut
              ? "Logging out..."
              : authLoading
              ? "..."
              : loggedInUser
              ? "Logout"
              : "Login"}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            to="/cart"
            onClick={closeMobileMenu}
            className="relative rounded-lg p-2 text-2xl"
            aria-label={`Cart with ${cartCount} items`}
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-700"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-md lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavLink
              to="/"
              end
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              Contact
            </NavLink>

            <NavLink
              to="/grocery"
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              Grocery
            </NavLink>

            {!authLoading && loggedInUser && (
              <NavLink
                to="/orders"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                My Orders
              </NavLink>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {authLoading ? "…" : userInitial}
                </div>

                <span className="max-w-36 truncate text-sm font-medium text-gray-700">
                  {authLoading ? "..." : userName}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAuth}
                disabled={authLoading || loggingOut}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loggingOut
                  ? "Logging out..."
                  : authLoading
                  ? "..."
                  : loggedInUser
                  ? "Logout"
                  : "Login"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                  onlineStatus
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              {onlineStatus ? "Online" : "Offline"}
            </p>
          </div>
        </nav>
      )}

      {logoutError && (
        <div
          role="alert"
          className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
};

export default memo(Header);
