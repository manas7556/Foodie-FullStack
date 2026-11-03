import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Login from "./components/Login";
import Header from "./components/Header";
import Body from "./components/Body";
import About from "./components/About";
import Contact from "./components/Contact";
import Grocery from "./components/Grocery";
import RestaurantMenu from "./components/RestaurantMenu";
import Cart from "./components/Cart";
import MyOrders from "./components/MyOrders";
import OrderDetails from "./components/OrderDetails";
import Signup from "./components/signup";

import UserContext from "./utils/UserContext";
import API_BASE from "./utils/api";

import { Provider } from "react-redux";
import appStore from "./utils/appStore";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

const AppLayout = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const checkLoggedInUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setUserInfo(null);
          return;
        }

        const response = await fetch(
          `${API_BASE}/users/current-user`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (!controller.signal.aborted) {
            localStorage.removeItem("accessToken");
            setUserInfo(null);
          }
          return;
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setUserInfo(
            data.success && data.data ? data.data : null
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to restore login session:",
            error
          );

          if (!controller.signal.aborted) {
            setUserInfo(null);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthLoading(false);
        }
      }
    };

    checkLoggedInUser();

    return () => controller.abort();
  }, []);

  return (
    <UserContext.Provider
      value={{
        loggedInUser: userInfo,
        setUserInfo,
        authLoading,
      }}
    >
      <div className="app min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white">
          <Header />
        </div>

        <main className="min-h-[70vh]">
          <Outlet />
        </main>
      </div>
    </UserContext.Provider>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Body /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "grocery", element: <Grocery /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      {
        path: "restaurants/:resId",
        element: <RestaurantMenu />,
      },
      { path: "cart", element: <Cart /> },
      { path: "orders", element: <MyOrders /> },
      {
        path: "orders/:orderId",
        element: <OrderDetails />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <Provider store={appStore}>
    <RouterProvider router={appRouter} />
  </Provider>
);