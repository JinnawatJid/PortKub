// Import necessary modules
import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";  // Import express-session for session management
import { fileURLToPath } from "url";
import createUserRoute from "../server/routes/createUser.js";
import userLoginRoute from "../server/routes/loginUser.js";  // Import loginUser.js route
import checkSessionRoute from "../server/routes/checkSession.js";  // Import checkSession.js route

// Emulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Use express-session middleware to manage session cookies
app.use(
  session({
    secret: "secret",  // Use a strong secret for demo purposes
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,  // Set to false for demo (use true with HTTPS)
      maxAge: 60 * 60 * 1000,  // Cookie expires in 1 hour
    },
  })
);

// Serve static files from the 'trading' directory
app.use(
  "/trading",
  express.static(path.join(__dirname, "../..", "frontend", "trading"))
);

// Serve static files from the 'virtualPort' directory
app.use(
  "/virtualPort",
  express.static(path.join(__dirname, "../..", "frontend", "virtualPort"))
);

// Serve static files from the 'media' directory
app.use("/media", express.static(path.join(__dirname, "../..", "media")));

// Redirect root URL to the trading app's index.html
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../..", "frontend", "trading", "index.html")
  );
});

// Endpoint to handle asset purchase
app.post("/api/buyAsset", (req, res) => {
  const { assetName, price, quantity } = req.body;

  saveAssetPurchase({ assetName, price, quantity })
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, message: "Database error" });
    });
});

// Endpoint to delete an asset
app.post("/api/deleteAsset", (req, res) => {
  const { assetName } = req.body;

  deleteAsset(assetName)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, message: "Database error" });
    });
});

// Use the create user route
app.use("/api", createUserRoute);

// Use the login route
app.use("/api", userLoginRoute);  // Add the user login route here

// Protect a route using checkSession middleware
app.use("/api/protected", checkSessionRoute);

// Function to simulate saving an asset purchase (for demo purposes)
function saveAssetPurchase(purchaseData) {
  return new Promise((resolve, reject) => {
    console.log("Saving purchase data:", purchaseData);
    resolve();
  });
}

// Function to simulate deleting an asset (for demo purposes)
function deleteAsset(assetName) {
  return new Promise((resolve, reject) => {
    console.log(`Deleting asset with name: ${assetName}`);
    resolve();
  });
}

// Start the main server
const port = 3000;
app.listen(port, () => {
  console.log(`Main server is running on port ${port}`);
});

// Automatically run the REST API Proxy (restproxy.js)
import "../RESTGETAPIProxy/restproxy.js";

// Automatically run the Kline WebSocket data server (kline.js)
import "../WSGETKlineData/kline.js";
