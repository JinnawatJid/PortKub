document.addEventListener("DOMContentLoaded", async function () {
  try {
      const username = localStorage.getItem('username'); // Assuming username is saved in localStorage

      if (!username) {
          console.error('Username is not found in localStorage');
          return;
      }

      // Mapping object for asset icons
      const assetIcons = {
          'bitcoin (btcusdt)': '../../media/icon/bitcoin.png',
          'binance (bnbusdt)': '../../media/icon/binance.png',
          'doge (dogeusdt)': '../../media/icon/doge.png',
          'ethereum (ethusdt)': '../../media/icon/ethereum.png',
          'solana (solusdt)': '../../media/icon/solana.png',
          'tether (usdtdai)': '../../media/icon/tether.png',
          'xrp (xrpusdt)': '../../media/icon/xrp.png'
      };

      const response = await fetch(`https://16a4-2001-44c8-46e1-1f5b-40b-af69-9a4d-b026.ngrok-free.app/api/portfolio?username=${username}`, {
          method: 'GET',
          headers: {
              "ngrok-skip-browser-warning": "true",
              "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)"
          }
      });

      if (response.ok) {
          const data = await response.json(); // Parse the JSON response
          console.log("Response Data:", data); // Log the parsed data

          if (data && data.assets && data.assets.length > 0) {
              const tableBody = document.getElementById('portfolioTableBody');
              let totalAssetValue = 0;
              let totalInvestmentValue = 0;
              let totalProfitLoss = 0;

              data.assets.forEach((asset) => {
                  const quantity = parseFloat(asset.quantity) || 0;
                  const currentPrice = parseFloat(asset.currentPrice) || 0;
                  const costValue = parseFloat(asset.total) || 0;
                  const currentValue = parseFloat(asset.currentValue) || 0;
                  const profitLoss = currentValue - costValue;

                  // Calculate total values
                  totalAssetValue += currentValue;
                  totalInvestmentValue += costValue;
                  totalProfitLoss += profitLoss;

                  console.log("Asset:", asset.name.toLowerCase());

                  // Get the icon path from the mapping object
                  const iconPath = assetIcons[asset.name.toLowerCase()] || '../../media/icon/bitcoin.png';

                  // Create a new row for the table
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>
                          <div class="assetIcon" style="display: flex; justify-content: center; align-items: center;">
                              <img class="asset_image" src="${iconPath}" alt="${asset.name}" style="height: 30px;">
                              <span style="margin-left: 8px;">${asset.name}</span>
                          </div>
                      </td>
                      <td>${quantity}</td>
                      <td>${asset.averageCostPrice.toFixed(2)}</td>
                      <td>${currentPrice.toFixed(2)}</td>
                      <td>${costValue.toFixed(2)}</td>
                      <td>${currentValue.toFixed(2)}</td>
                      <td>${profitLoss.toFixed(2)}</td>
                      <td>${asset.profitLossPercent.toFixed(2)}%</td>
                      <td><img src="../../media/icon/Cross.png" class="delete-icon" alt="Delete"></td>
                  `;
                  tableBody.appendChild(row);
              });

              // Update the Current Asset Value section
              document.getElementById('currentPrice').innerText = `${totalAssetValue.toFixed(2)} USD`;

              // Update the Investment Value and Profit/Loss
              const investmentValueElements = document.querySelectorAll('.investmentValueContainer h4');
              investmentValueElements[0].innerText = `${totalInvestmentValue.toFixed(2)} USD`;
              const profitLossElements = document.querySelectorAll('.profitLossContainer h4');
              profitLossElements[0].innerText = `${totalProfitLoss.toFixed(2)} USD`;
              profitLossElements[1].innerText = `${totalProfitLoss.toFixed(2)} USD`;
          }
      } else {
          console.error("Request failed with status:", response.status);
      }
  } catch (error) {
      console.error("Error in fetch request:", error);
  }
});