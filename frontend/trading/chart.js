const log = console.log;

// Mapping object for assets
const assetMapping = {
  btc: {
    symbol: "BTCUSDT",
    name: "Bitcoin (BTCUSDT)",
    icon: "../../media/icon/bitcoin.png",
  },
  eth: {
    symbol: "ETHUSDT",
    name: "Ethereum (ETHUSDT)",
    icon: "../../media/icon/ethereum.png",
  },
  usdt: {
    symbol: "USDTDAI",
    name: "Tether (USDTDAI)",
    icon: "../../media/icon/tether.png",
  },
  bnb: {
    symbol: "BNBUSDT",
    name: "Binance (BNBUSDT)",
    icon: "../../media/icon/binance.png", // Updated to binance.png
  },
  sol: {
    symbol: "SOLUSDT",
    name: "Solana (SOLUSDT)",
    icon: "../../media/icon/solana.png",
  },
  xrp: {
    symbol: "XRPUSDT",
    name: "XRP (XRPUSDT)",
    icon: "../../media/icon/xrp.png",
  },
  doge: {
    symbol: "DOGEUSDT",
    name: "DOGE (DOGEUSDT)",
    icon: "../../media/icon/doge.png",
  },
};

// Chart properties
const chartProperties = {
  width: window.innerWidth * 0.8,
  height: window.innerHeight * 0.8,
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  },
  layout: {
    background: { color: "#222" },
    textColor: "#C3BCDB",
  },
  grid: {
    vertLines: { color: "#444" },
    horzLines: { color: "#444" },
  },
};

// Initialize the chart
const domElement = document.getElementById("tvchart");
const chart = LightweightCharts.createChart(domElement, chartProperties);
let currentPrice;

// Set border colors for the chart
chart.priceScale().applyOptions({ borderColor: "#71649C" });
chart.timeScale().applyOptions({ borderColor: "#71649C" });

const candleSeries = chart.addCandlestickSeries();

// Function to fetch and update chart data
function updateChart(token) {
  const baseURL =
    "https://2da6-2001-44c8-46e1-1f5b-40b-af69-9a4d-b026.ngrok-free.app/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=";
  const fetchURL = `${baseURL}${token}`;

  fetch(fetchURL, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      const cdata = data.map((d) => {
        const utcTime = new Date(d[0]);
        const utc7Time = new Date(utcTime.getTime() + 7 * 60 * 60 * 1000); // Convert to UTC+7
        return {
          time: utc7Time.getTime() / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        };
      });
      candleSeries.setData(cdata);
    })
    .catch((err) => console.error("Error fetching data:", err));
}

// Initialize chart with default token
updateChart("BTCUSDT&interval=1m&limit=1000");

// Select the asset_name and asset_image elements
const assetNameElement = document.querySelector(".asset_name");
const assetImageElement = document.querySelector(".asset_image");

// Function to handle button clicks
function handleAssetButtonClick(assetKey) {
  const asset = assetMapping[assetKey];
  if (!asset) return;

  // Update the chart with the selected asset's symbol
  updateChart(`${asset.symbol}&interval=1m&limit=1000`);

  // Update the asset name and icon
  assetNameElement.textContent = asset.name;
  assetImageElement.src = asset.icon;
  assetImageElement.alt = `${asset.name} logo`;

  // Emit the symbol change to the socket
  socket.emit("CHANGE_SYMBOL", asset.symbol);
}

// Attach event listeners to buttons dynamically
Object.keys(assetMapping).forEach((assetKey) => {
  const button = document.getElementById(`${assetKey}Button`);
  if (button) {
    button.addEventListener("click", () => handleAssetButtonClick(assetKey));
  }
});

// Add window resize event handler
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth * 0.8, window.innerHeight * 0.8);
});

// Socket.io connection for real-time updates
const socket = io.connect(
  "https://6e2f-2001-44c8-46e1-1f5b-40b-af69-9a4d-b026.ngrok-free.app/",
  {
    withCredentials: true,
    transports: ["websocket"],
    transportOptions: {
      websocket: {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)",
        },
      },
    },
  }
);

// Handle real-time KLINE data
socket.on("KLINE", (pl) => {
  candleSeries.update(pl);
  currentPrice = pl.close;
  document.getElementById(
    "currentPrice"
  ).innerText = `Current Price: ${currentPrice}`;
});

// Buy button event listener
document.getElementById("buyButton").addEventListener("click", () => {
  const assetName = assetNameElement.textContent;
  const currentPrice = parseFloat(
    document.getElementById("currentPrice").textContent.replace("Current Price: ", "").trim()
  );
  const username = localStorage.getItem("username");

  console.log("Asset Name:", assetName);
  console.log("Current Price:", currentPrice);
  console.log("Username:", username);

  // Fetch user's virtual money
  fetch("/api/getVirtualMoney", {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)",
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch virtual money: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        const virtualMoney = data.virtualMoney;
        console.log("User's virtual money:", virtualMoney);

        // Show SweetAlert2 popup for quantity input
        Swal.fire({
          title: "Enter Quantity",
          html: `
            <div style="text-align: left;">
              <p><strong>Asset Name:</strong> ${assetName}</p>
              <p><strong>Current Price:</strong> ${currentPrice}</p>
              <label for="quantityInput"><strong>Quantity:</strong></label>
              <input id="quantityInput" type="number" min="1" value="1" class="swal2-input" />
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#17A37A",
          cancelButtonColor: "#AE1F0E",
          preConfirm: () => {
            const quantity = document.getElementById("quantityInput").value;
            return {
              assetName,
              currentPrice,
              quantity,
              username,
            };
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const { assetName, currentPrice, quantity, username } = result.value;
            const totalCost = currentPrice * quantity;

            if (!quantity || quantity <= 0) {
              Swal.showValidationMessage("Please enter a valid quantity");
              return;
            }

            if (virtualMoney >= totalCost) {
              fetch("/api/buyAsset", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ assetName, currentPrice, quantity, totalCost, username }),
                credentials: "same-origin",
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    Swal.fire("Success!", "Asset purchase has been recorded.", "success");
                  } else {
                    Swal.fire("Error!", "There was a problem with the purchase.", "error");
                  }
                })
                .catch((error) => {
                  console.error("Error during purchase process:", error);
                  Swal.fire("Error!", "Unable to reach the server.", "error");
                });
            } else {
              Swal.fire("Insufficient Balance", "You do not have enough virtual money", "error");
            }
          }
        });
      } else {
        Swal.fire("Error", "Unable to fetch virtual money", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire("Error", "Unable to fetch virtual money", "error");
    });
});