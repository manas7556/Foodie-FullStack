import { createContext } from "react";

const UserContext = createContext({
  loggedInUser: null,
  setUserInfo: () => {},
  authLoading: false,
});

export default UserContext;