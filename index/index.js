//Pseudo code
//Step 1: Define chart properties.
//Step 2: Create the chart with defined properties and bind it to the DOM element.
//Step 3: Add the CandleStick Series.
//Step 4: Set the data and render.
//Step5 : Plug the socket to the chart


//Code
const log = console.log;

const chartProperties = {
  width: window.innerWidth*0.8,
  height: window.innerHeight*0.8,
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

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement,chartProperties);

// Setting the border color for the vertical axis
chart.priceScale().applyOptions({
  borderColor: "#71649C",
});

// Setting the border color for the horizontal axis
chart.timeScale().applyOptions({
  borderColor: "#71649C",
});

const candleSeries = chart.addCandlestickSeries();

// Adding a window resize event handler to resize the chart when
// the window size changes.
// Note: for more advanced examples (when the chart doesn't fill the entire window)
// you may need to use ResizeObserver -> https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth*0.8, window.innerHeight*0.8);
});

fetch('http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000')
  .then(res => {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.json();
  })
  .then(data => {
    const cdata = data.map(d => {
      // Convert the timestamp to UTC+7
      const utcTime = new Date(d[0]);
      const utc7Time = new Date(utcTime.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours

      return {
        time: utc7Time.getTime() / 1000, // Use the adjusted time in seconds
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4])
      };
    });
    candleSeries.setData(cdata);
  })
  .catch(err => console.error('Error fetching data:', err));

//Dynamic Chart
const socket = io.connect('http://127.0.0.1:4000/');

socket.on('KLINE',(pl)=>{
  //log(pl);
  candleSeries.update(pl);
});

document.addEventListener("DOMContentLoaded", function() {
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileIcon = profileDropdown.querySelector(".profile-icon");

  profileIcon.addEventListener("click", function() {
      profileDropdown.classList.toggle("active");
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", function(event) {
      if (!profileDropdown.contains(event.target)) {
          profileDropdown.classList.remove("active");
      }
  });
});