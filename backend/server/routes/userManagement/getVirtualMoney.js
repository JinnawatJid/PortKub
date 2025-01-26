import express from "express";
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

// Fetch Virtual Money
router.get("/", async (req, res) => {
  // Check if the user is logged in by verifying session data (using username now)
  if (!req.session.username) {
    console.log("User not logged in");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Please log in first." });
  }

  try {
    const username = req.session.username;
    console.log("Fetching virtual money for user:", username);

    // Query the database to get the virtual money for the logged-in user
    const query = "SELECT virtualmoney FROM users WHERE username = $1";
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      console.log("User not found:", username);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const virtualMoney = result.rows[0].virtualmoney;
    console.log("Virtual money fetched:", virtualMoney);

    // Return the virtual money amount
    res.status(200).json({
      success: true,
      virtualMoney: virtualMoney,
    });
  } catch (error) {
    console.error("Error fetching virtual money:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;
