import { ApiError } from "../utils/ApiError.js";

// ========================================
// VERIFY ADMIN ROLE
// ========================================

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return next(
      new ApiError(401, "Authentication required")
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new ApiError(
        403,
        "Access denied. Admin privileges required."
      )
    );
  }

  next();
};

export { verifyAdmin };