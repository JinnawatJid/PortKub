// Import necessary modules
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Serve static files from the 'trading' directory
app.use("/trading", express.static(path.join(__dirname, "..", "app", "trading")));

// Serve static files from the 'virtualPort' directory
app.use("/virtualPort", express.static(path.join(__dirname, "..", "app", "virtualPort")));

// Serve static files from the 'media' directory
app.use("/media", express.static(path.join(__dirname, "..", "media")));

// Redirect root URL to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "app", "trading", "index.html"));
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
    // Implement actual database logic here, if using a real database
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
require("../RESTGETAPIProxy/restproxy");

// Automatically run the Kline WebSocket data server (kline.js)
require("../WSGETKlineData/kline");
