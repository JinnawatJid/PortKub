import express from "express";
import bcrypt from "bcrypt";
import db from "../condb.js";
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

// User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    // Check if the username exists
    const checkUserQuery = "SELECT * FROM users WHERE username = $1";
    const checkUserResult = await db.query(checkUserQuery, [username]);

    if (checkUserResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const user = checkUserResult.rows[0];

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Store session data
    req.session.userId = user.userId;
    req.session.username = user.username;

    // Return success response with the username and session token
    res.status(200).json({
      message: "Login successful.",
      username: user.username,
      token: req.sessionID, // Or you could generate a custom token if necessary
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// User Logout
router.post("/logout", (req, res) => {
  // Destroy the session and the cookie to log the user out
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });
});

export default router;
