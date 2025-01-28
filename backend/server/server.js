// Import necessary modules
import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import { fileURLToPath } from "url";
import createUserRoute from "../server/routes/userManagement/createUser.js";
import userLoginRoute from "../server/routes/userManagement/loginUser.js";
import checkSessionRoute from "../server/routes/userManagement/checkSession.js";
import getVirtualMoneyRoutes from "../server/routes/userManagement/getVirtualMoney.js";
import buyAssetRoute from "../server/routes/portfolioManagement/buyAsset.js";
import getAssetRoute from "../server/routes/portfolioManagement/getAsset.js";

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
    path.join(__dirname, "../..", "frontend", "trading", "trading.html")
  );
});

// Use the create user route
app.use("/api", createUserRoute);

// Use the login route
app.use("/api", userLoginRoute);  // Add the user login route here

app.use("/api/getVirtualMoney", getVirtualMoneyRoutes); // Use the virtual money route

// Protect a route using checkSession middleware
app.use("/api/protected", checkSessionRoute);

app.use("/api/portfolio", getAssetRoute);  // Use the getAsset route

// Use the buy asset route
app.use("/api", buyAssetRoute);  // Add the buyAsset route here

// Start the main server
const port = 3000;
app.listen(port, () => {
  console.log(`Main server is running on port ${port}`);
});

// Automatically run the REST API Proxy (restproxy.js)
import "../RESTGETAPIProxy/restproxy.js";

// Automatically run the Kline WebSocket data server (kline.js)
import "../WSGETKlineData/kline.js";