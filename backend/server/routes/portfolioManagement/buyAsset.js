import express from 'express';
import db from '../../condb.js';  // Import the PostgreSQL client

const router = express.Router();

// Handle asset purchase
router.post('/buyAsset', (req, res) => {
  const { assetName, currentPrice, quantity, totalCost, username } = req.body;

  console.log('Received request to buy asset:', { assetName, currentPrice, quantity, totalCost, username });

  // Step 1: Check if the user has enough virtual money
  db.query('SELECT virtualmoney FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (result.rows.length === 0) {
      console.error('User not found for username:', username);
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const userVirtualMoney = result.rows[0].virtualmoney;
    console.log(`User ${username} has ${userVirtualMoney} virtual money.`);

    // Check if user has enough virtual money
    if (userVirtualMoney < totalCost) {
      console.error(`User ${username} has insufficient balance. Required: ${totalCost}, Available: ${userVirtualMoney}`);
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Step 2: Deduct the total cost from user's virtual money
    db.query('UPDATE users SET virtualmoney = virtualmoney - $1 WHERE username = $2', [totalCost, username], (err) => {
      if (err) {
        console.error('Error updating virtual money for user:', username, err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      console.log(`Updated virtual money for user ${username}. Deducted: ${totalCost}`);

      // Step 3: Check if the asset exists in the user's portfolio
      db.query('SELECT * FROM portfolio WHERE portowner = $1 AND assetname = $2', [username, assetName], (err, result) => {
        if (err) {
          console.error('Error fetching portfolio data for user:', username, err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        console.log(`Portfolio query result for ${username} and asset ${assetName}:`, result.rows);

        if (result.rows.length > 0) {
          // Asset exists in the portfolio, update the quantity
          const currentAsset = result.rows[0];
          const newQuantity = parseFloat(currentAsset.quantity) + parseFloat(quantity);
          const newTotalCost = parseFloat(currentAsset.total) + parseFloat(totalCost);

          console.log(`Updating existing portfolio asset for ${username}: ${assetName}. New quantity: ${newQuantity}, New total cost: ${newTotalCost}`);

          // Update portfolio asset
          db.query(
            'UPDATE portfolio SET quantity = $1, total = $2 WHERE portowner = $3 AND assetname = $4',
            [newQuantity, newTotalCost, username, assetName],
            (err) => {
              if (err) {
                console.error('Error updating portfolio asset:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
              }

              console.log(`Portfolio asset for ${username} updated successfully.`);
              return res.status(200).json({ success: true, message: 'Asset purchase successful' });
            }
          );
        } else {
          // Asset does not exist in the portfolio, add a new record
          console.log(`Asset ${assetName} not found in portfolio for ${username}. Adding new record.`);

          db.query(
            'INSERT INTO portfolio (portowner, username, assetname, quantity, total) VALUES ($1, $2, $3, $4, $5)',
            [username, username, assetName, parseFloat(quantity), parseFloat(totalCost)],
            (err) => {
              if (err) {
                console.error('Error inserting portfolio asset:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
              }

              console.log(`New asset added to portfolio for ${username}. Asset: ${assetName}, Quantity: ${quantity}, Total Cost: ${totalCost}`);
              return res.status(200).json({ success: true, message: 'Asset purchase successful' });
            }
          );
        }
      });
    });
  });
});

export default router;
