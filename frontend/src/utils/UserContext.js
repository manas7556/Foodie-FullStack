import { createContext } from "react";

const UserContext = createContext({
    loggedInUser: "null",
    setUserInfo: () => {},
});

export default UserContext;