const log = console.log;

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

const domElement = document.getElementById("tvchart");
const chart = LightweightCharts.createChart(domElement, chartProperties);
let currentPrice;

// Setting the border color for the vertical and horizontal axis
chart.priceScale().applyOptions({ borderColor: "#71649C" });
chart.timeScale().applyOptions({ borderColor: "#71649C" });

const candleSeries = chart.addCandlestickSeries();

// Function to fetch and update chart data
function updateChart(token) {
  const baseURL =
    "https://101d-2001-44c8-6110-4dac-1c67-4c4-7350-8bbf.ngrok-free.app/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol="; //:9665
  const fetchURL = `${baseURL}${token}`;

  fetch(fetchURL, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true", // Skip ngrok's browser warning
      "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)", // Custom User-Agent
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
        // Convert the timestamp to UTC+7
        const utcTime = new Date(d[0]);
        const utc7Time = new Date(utcTime.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours

        return {
          time: utc7Time.getTime() / 1000, // Use the adjusted time in seconds
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

// Select the asset_name element
const assetNameElement = document.querySelector(".asset_name");
const assetImageElement = document.querySelector(".asset_image");

// Event listener for buttons
document.getElementById("btcButton").addEventListener("click", () => {
  updateChart("BTCUSDT&interval=1m&limit=1000");
  const symbol = "BTCUSDT";
  assetNameElement.textContent = "Binance BTCUSDT Chart (Bitcoin)";
  assetImageElement.src = "../../media/icon/bitcoin.png";
  assetImageElement.alt = "bitcoin logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("ethButton").addEventListener("click", () => {
  updateChart("ETHUSDT&interval=1m&limit=1000");
  const symbol = "ETHUSDT";
  assetNameElement.textContent = "Binance ETHUSDT Chart (Ethereum)";
  assetImageElement.src = "../../media/icon/ethereum.png";
  assetImageElement.alt = "ethereum logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("usdtButton").addEventListener("click", () => {
  updateChart("USDTDAI&interval=1m&limit=1000");
  const symbol = "USDTDAI";
  assetNameElement.textContent = "Binance USDTDAI Chart (Tether)";
  assetImageElement.src = "../../media/icon/tether.png";
  assetImageElement.alt = "tether logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("bnbButton").addEventListener("click", () => {
  updateChart("BNBUSDT&interval=1m&limit=1000");
  const symbol = "BNBUSDT";
  assetNameElement.textContent = "Binance BNBUSDT Chart (Binance)";
  assetImageElement.src = "../../media/icon/bnb.png";
  assetImageElement.alt = "bnb logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("solButton").addEventListener("click", () => {
  updateChart("SOLUSDT&interval=1m&limit=1000");
  const symbol = "SOLUSDT";
  assetNameElement.textContent = "Binance SOLUSDT Chart (Solana)";
  assetImageElement.src = "../../media/icon/solana.png";
  assetImageElement.alt = "solana logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("xrpButton").addEventListener("click", () => {
  updateChart("XRPUSDT&interval=1m&limit=1000");
  const symbol = "XRPUSDT";
  assetNameElement.textContent = "Binance XRPUSDT Chart (XRP)";
  assetImageElement.src = "../../media/icon/xrp.png";
  assetImageElement.alt = "xrp logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("dogeButton").addEventListener("click", () => {
  updateChart("DOGEUSDT&interval=1m&limit=1000");
  const symbol = "DOGEUSDT";
  assetNameElement.textContent = "Binance DOGEUSDT Chart (DOGE)";
  assetImageElement.src = "../../media/icon/doge.png";
  assetImageElement.alt = "doge logo";
  socket.emit("CHANGE_SYMBOL", symbol);
});

// Adding a window resize event handler to resize the chart when the window size changes
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth * 0.8, window.innerHeight * 0.8);
});

// Dynamic Chart
const socket = io.connect("https://d93d-2001-44c8-6110-4dac-1c67-4c4-7350-8bbf.ngrok-free.app/", { //:4000
  withCredentials: true, // Make sure to allow credentials
  transports: ["websocket"], // Specify WebSocket transport
  transportOptions: {
    websocket: {
      headers: {
        "ngrok-skip-browser-warning": "true", // Skip ngrok's browser warning
        "User-Agent": "Mozilla/5.0 (compatible; MyCustomAgent/1.0)", // Custom User-Agent
      },
    },
  },
});

socket.on("KLINE", (pl) => {
  // Update the chart with the new data
  candleSeries.update(pl);

  currentPrice = pl.close;
  document.getElementById(
    "currentPrice"
  ).innerText = `Current Price: ${currentPrice}`;
});

document.getElementById("buyButton").addEventListener("click", () => {
  const assetName = "Binance BTCUSDT Chart (Bitcoin)"; // Example asset name. Adjust as needed.
  currentPrice; // Example price. Adjust as needed.

  Swal.fire({
    title: "Buy Asset",
    html: `
      <div style="text-align: left;">
        <p><strong>Asset Name:</strong> ${assetName}</p>
        <p><strong>Current Price:</strong> ${currentPrice}</p>
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" placeholder="Enter quantity" class="swal2-input">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#17A37A",
    cancelButtonColor: "#AE1F0E",

    preConfirm: () => {
      const quantity = document.getElementById("quantity").value;
      if (!quantity) {
        Swal.showValidationMessage("Please enter a quantity");
      }
      return { assetName, currentPrice, quantity };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const { assetName, currentPrice, quantity } = result.value;

      // Step 3: Send data to the server using AJAX
      fetch("http://localhost:3000/api/buyAsset", {
        // Replace '/api/buyAsset' with your actual endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assetName, price: currentPrice, quantity }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire(
              "Success!",
              "Asset purchase has been recorded.",
              "success"
            );
          } else {
            Swal.fire(
              "Error!",
              "There was a problem with the purchase.",
              "error"
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire("Error!", "Unable to reach the server.", "error");
        });
    }
  });
});
