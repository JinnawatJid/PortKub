import express from "express";
import bcrypt from "bcrypt";
import db from "../../condb.js";
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
    // Log received data for debugging
    console.log("Received login request with username:", username);

    // Check if the username exists
    const checkUserQuery = "SELECT * FROM users WHERE username = $1";
    const checkUserResult = await db.query(checkUserQuery, [username]);

    if (checkUserResult.rows.length === 0) {
      console.log("User not found in database for username:", username);
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const user = checkUserResult.rows[0];
    console.log("User found in database:", user);

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", passwordMatch);  // Log password match result

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Store session data using username instead of userId
    req.session.username = user.username;
    console.log("Session data stored:", req.session);  // Log session data

    // Log session after login
    console.log("Session data after login:", req.session);

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
