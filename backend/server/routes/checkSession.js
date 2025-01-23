import express from "express";
import session from "express-session";

const router = express.Router();

// Use express-session middleware with cookie settings
router.use(
  session({
    secret: "secret", // Use a strong secret for demo purposes
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to false as we're not using HTTPS for demo
      maxAge: 60 * 60 * 1000, // The cookie will expire in 1 hour
    },
  })
);

// Middleware to check if user is logged in
router.use((req, res, next) => {
  if (req.session.userId) {
    // If session has userId, the user is logged in
    return next(); // Continue to the requested route
  } else {
    // If no user session exists, send unauthorized response
    return res.status(401).json({ message: "User not logged in." });
  }
});

// Protected route example (accessible only to logged-in users)
router.get("/protected", (req, res) => {
  res.status(200).json({ message: "You are authorized.", username: req.session.username });
});

export default router;
