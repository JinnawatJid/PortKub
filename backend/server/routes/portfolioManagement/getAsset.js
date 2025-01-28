import express from 'express';
import db from '../../condb.js'; // Import the PostgreSQL client
import fetch from 'node-fetch'; // For making API requests

const router = express.Router();

// Route to get assets for a specific user
router.get('/', async (req, res) => {
    try {
        // Log incoming request data
        console.log('Received GET request for /api/portfolio');
        console.log('Request headers:', req.headers);
        console.log('Request query parameters:', req.query);

        const username = req.query.username; // Extract username from query params

        if (!username) {
            console.error('Username is required in query parameters');
            return res.status(400).json({ message: 'Username is required' });
        }

        // Log the username before querying the database
        console.log('Searching for assets for username:', username);

        // Fetch portfolio data from the database
        const query = `
            SELECT 
                assetname AS name,
                quantity,
                total,
                createdat
            FROM 
                portfolio
            WHERE 
                username = $1
        `;
        const { rows: assets } = await db.query(query, [username]);

        // Log the results from the database
        console.log('Assets fetched:', assets);

        // Fetch current prices for all assets in the portfolio
        const assetNames = assets.map((asset) => asset.name);
        const currentPrices = await fetchCurrentPrices(assetNames);

        // Calculate additional fields for each asset
        const enhancedAssets = assets.map((asset) => {
            const currentPrice = currentPrices[asset.name] || 0; // Default to 0 if price not found
            const averageCostPrice = asset.total / asset.quantity; // Average cost price per unit
            const currentValue = currentPrice * asset.quantity; // Current value of the asset
            const profitLossUSD = currentValue - asset.total; // Profit/Loss in USD
            const profitLossPercent = (profitLossUSD / asset.total) * 100; // Profit/Loss percentage

            return {
                ...asset,
                averageCostPrice,
                currentPrice,
                currentValue,
                profitLossUSD,
                profitLossPercent,
            };
        });

        // Return the enhanced data
        res.json({ assets: enhancedAssets });
    } catch (err) {
        // Log detailed error information
        console.error('Error fetching assets:', err);
        res.status(500).json({ message: 'Error fetching assets' });
    }
});

// Helper function to fetch current prices from Binance API
async function fetchCurrentPrices(assetNames) {
    const prices = {};
    for (const assetName of assetNames) {
        try {
            // Extract the symbol part from the asset name (e.g., "Ethereum (ETHUSDT)" -> "ETHUSDT")
            const symbolMatch = assetName.match(/\(([^)]+)\)/); // Match the part inside parentheses
            if (!symbolMatch) {
                console.error(`No symbol found in asset name: ${assetName}`);
                prices[assetName] = 0; // Default to 0 if no symbol is found
                continue;
            }

            const symbol = symbolMatch[1]; // Extract the symbol (e.g., "ETHUSDT")
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await response.json();

            if (!data.price) {
                console.error(`No price data found for symbol: ${symbol}`);
                prices[assetName] = 0; // Default to 0 if no price is found
                continue;
            }

            prices[assetName] = parseFloat(data.price); // Store the current price
        } catch (error) {
            console.error(`Error fetching price for ${assetName}:`, error);
            prices[assetName] = 0; // Default to 0 if price fetch fails
        }
    }
    return prices;
}

export default router;