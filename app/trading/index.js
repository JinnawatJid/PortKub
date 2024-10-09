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

// Setting the border color for the vertical and horizontal axis
chart.priceScale().applyOptions({ borderColor: "#71649C" });
chart.timeScale().applyOptions({ borderColor: "#71649C" });

const candleSeries = chart.addCandlestickSeries();

// Function to fetch and update chart data
function updateChart(token) {
  const baseURL =
    "http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=";
  const fetchURL = `${baseURL}${token}`;

  fetch(fetchURL)
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
const assetNameElement = document.querySelector('.asset_name');

// Event listener for buttons
document.getElementById("btcButton").addEventListener("click", () => {
    updateChart("BTCUSDT&interval=1m&limit=1000");
    const symbol = "BTCUSDT";
    assetNameElement.textContent = 'Binance BTCUSDT Chart (Bitcoin)';
    socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("ethButton").addEventListener("click", () => {
    updateChart("ETHUSDT&interval=1m&limit=1000");
    const symbol = "ETHUSDT";
    assetNameElement.textContent = 'Binance ETHUSDT Chart (Ethereum)';
    socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("usdtButton").addEventListener("click", () => {
  updateChart("USDTDAI&interval=1m&limit=1000");
  const symbol = "USDTDAI";
  assetNameElement.textContent = 'Binance USDTDAI Chart (Tether)';
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("bnbButton").addEventListener("click", () => {
  updateChart("BNBUSDT&interval=1m&limit=1000");
  const symbol = "BNBUSDT";
  assetNameElement.textContent = 'Binance BNBUSDT Chart (BNB)';
  socket.emit("CHANGE_SYMBOL", symbol);
});

document.getElementById("solButton").addEventListener("click", () => {
  updateChart("SOLUSDT&interval=1m&limit=1000");
  const symbol = "SOLUSDT";
  assetNameElement.textContent = 'Binance SOLUSDT Chart (Solana)';
  socket.emit("CHANGE_SYMBOL", symbol);
});

// Adding a window resize event handler to resize the chart when the window size changes
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth * 0.8, window.innerHeight * 0.8);
});

// Dynamic Chart
const socket = io.connect("http://127.0.0.1:4000/");

socket.on("KLINE", (pl) => {
  // Ensure the 'pl' data format is correct for `candleSeries.update`
  candleSeries.update(pl);
});

// Profile dropdown logic
document.addEventListener("DOMContentLoaded", function () {
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileIcon = profileDropdown.querySelector(".profile-icon");

  profileIcon.addEventListener("click", function () {
    profileDropdown.classList.toggle("active");
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", function (event) {
    if (!profileDropdown.contains(event.target)) {
      profileDropdown.classList.remove("active");
    }
  });
});