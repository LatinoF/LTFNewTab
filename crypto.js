const coins = ["dogecoin", "bitcoin", "ethereum"];

async function getPriceData(coin) {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=0.08`);
  return (await response.json()).prices;
}

async function createChart(coin) {
  const chartData = await getPriceData(coin);
  const margin = { top: 20, right: 0, bottom: 80, left: 0 };
  const width = 980 - margin.left - margin.right;
  const height = 217 - margin.top - margin.bottom;
  const x = d3.scaleUtc().domain(d3.extent(chartData, (d) => new Date(d[0]))).range([0, width]);
  const y = d3.scaleLinear().domain(d3.extent(chartData, (d) => d[1])).range([height, 0]);
  const line = d3.line().x((d) => x(new Date(d[0]))).y((d) => y(d[1])).curve(d3.curveNatural);
  const area = d3.area().x((d) => x(new Date(d[0]))).y0(y(0)).y1((d) => y(d[1])).curve(d3.curveNatural);
  const svg = d3.select(`#${coin}Chart`).append("svg").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add a transparent rectangle covering the entire chart area
  svg.append('rect')
    .attr('width', width)
    .attr('height', 300) 
    .attr('fill', 'transparent')
    .attr('y', -100);

  svg.on('mousemove', function (event) {
    const [mouseX, mouseY] = d3.pointer(event, this);
    const bisector = d3.bisector(d => new Date(d[0])).left;
    const xDate = x.invert(mouseX);
    const index = bisector(chartData, xDate, 1);
    const dataPoint = index < chartData.length ?
      (xDate - new Date(chartData[index - 1][0]) > new Date(chartData[index][0]) - xDate ?
        chartData[index] :
        chartData[index - 1])
      : chartData[index - 1];

    const digits = coin === 'dogecoin' ? 6 : (coin === 'bitcoin' || coin === 'ethereum' ? 0 : 2);
    const value = '$ ' + dataPoint[1].toFixed(digits);
    tooltip.select('text').text(value);

    const bbox = tooltip.select('text').node().getBBox();
    const padding = { x: 6, y: 4 };
    rect.attr('width', bbox.width + padding.x * 2)
      .attr('height',  bbox.height + padding.y)
      .attr('x', -(bbox.width + padding.x * 2) / 2)
      .attr('y', -(bbox.height + padding.y * 2) / 2);
    text.attr('x', 0).attr('y', 0).text(value);

    // Set tooltip position based on mouseX and mouseY
    const tooltipWidth = tooltip.node().getBoundingClientRect().width;
    const tooltipHeight = tooltip.node().getBoundingClientRect().height;
    const tooltipX = mouseX > width / 2 ? mouseX - 50 : mouseX + 50;
    const tooltipY = mouseY - bbox.height + 40;
    tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`).style('display', 'block');
  });

    svg.on('mouseout', () => tooltip.style('display', 'none'))
    svg.on('mouseover', () => tooltip.style('display', 'block'));

  svg.append("path").datum(chartData).attr("fill", "rgba(0, 178, 200, 0.3)").attr("d", area);
  svg.append("path").datum(chartData).attr("fill", "none").attr("stroke", "rgb(0, 178, 200)").attr("stroke-width", 4).attr("d", line);

  const tooltip = svg.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none')
    .attr('transform', 'translate(-100,-100)');

  const rect = tooltip.append('rect')
    .attr('fill', 'black')
    .attr('rx', 9)
    .attr('ry', 9)
    .attr('opacity', 0.8);

  const text = tooltip.append('text')
    .attr('fill', 'white')
    .attr('opacity', 0.8)
    .style('font-size', '12px')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle');
}

async function updateCharts() {
  for (const coin of coins) {
    await createChart(coin);
  }
}

// Call the updateCharts function immediately
updateCharts();

// Call the updateCharts function every 10 seconds
setInterval(updateCharts, 10000);




const getCurrentPrice = async (coin) => {
  const { prices } = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`).then(response => response.json());

  const [yesterdayClosePrice, currentPrice] = [prices[0][1], prices[prices.length - 1][1]];
  const [minPrice, maxPrice] = [Math.min(...prices.map(([time, price]) => price)), Math.max(...prices.map(([time, price]) => price))];
  const priceChangePercentage = ((currentPrice - yesterdayClosePrice) / yesterdayClosePrice) * 100;

  return { currentPrice, minPrice, maxPrice, priceChangePercentage };
};

async function updateCurrentPrice() {
  for (const coin of coins) {
    const { currentPrice, minPrice, maxPrice, priceChangePercentage } = await getCurrentPrice(coin);
    const currentPriceElement = document.getElementById(`${coin}CurrentPrice`);
    currentPriceElement.textContent = `$ ${currentPrice.toFixed(coin === "dogecoin" ? 6 : 0)}`;

    const minPriceElement = document.getElementById(`${coin}MinPrice`);
    minPriceElement.textContent = `${minPrice.toFixed(coin === "dogecoin" ? 6 : 0)}`;

    const maxPriceElement = document.getElementById(`${coin}MaxPrice`);
    maxPriceElement.textContent = `${maxPrice.toFixed(coin === "dogecoin" ? 6 : 0)}`;

    const marketElement = document.getElementById(`${coin}Market`);
    const marketIconElement = document.getElementById(`${coin}MarketIcon`);
    marketElement.textContent = `${Math.abs(priceChangePercentage).toFixed(2)}%`;
    marketElement.style.color = marketIconElement.style.color = priceChangePercentage > 0 ? 'green' : 'red';
    marketIconElement.className = `ti ti-arrow-big-${priceChangePercentage > 0 ? 'up' : 'down'}-filled`;
  }
}

// Call the updateCurrentPrice function immediately
updateCurrentPrice();

// Call the updateCurrentPrice function every 10 seconds
setInterval(updateCurrentPrice, 10000);