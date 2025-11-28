const apiKey = "bc1301b0b23fe6ef52032a7e5bb70820";
const city = "Torrevecchia Teatina";
const weatherIcon = document.querySelector(".weather-icon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feels-like");
const pressure = document.querySelector(".pressure");
const uvIndexElement = document.querySelector(".uv-index");
const wind = document.querySelector(".wind");
const humidity = document.querySelector(".humidity");


// function to fetch weather data and update the UI
function fetchWeatherData() {
fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
  .then(response => response.json())
  .then(data => {
    const weatherCode = data.weather[0].id;
    const iconPath = getWeatherIconPath(weatherCode, data.sys.sunrise, data.sys.sunset);
    weatherIcon.setAttribute("src", iconPath);
    temperature.innerHTML = `${Math.round(data.main.temp)}&deg;C`;
    feelsLike.innerHTML = `${Math.round(data.main.feels_like)}&deg;C`;
    pressure.innerHTML = `${data.main.pressure} hPa`;
    wind.innerHTML = `${data.wind.speed} m/s`;
    humidity.innerHTML = `${data.main.humidity}%`;

    //UV Index Fetch
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}&units=metric`)
      .then(response => response.json())
      .then(data => {
        const uvIndex = data.current.uvi;
        uvIndexElement.innerHTML = `${uvIndex}`;
      })
      .catch(error => console.log(error));
  })
  .catch(error => console.log(error));
}

// initial fetch of weather data
fetchWeatherData();

// call fetchWeatherData() every minute
setInterval(fetchWeatherData, 10*60000);

// set weather condition icons
function getWeatherIconPath(weatherCode, sunrise, sunset) {
  const currentTime = new Date().getTime() / 1000;
  const isDaytime = currentTime >= sunrise && currentTime <= sunset;

  if (weatherCode >= 200 && weatherCode < 300) {
    //Thunderstorm
    return "Resources/Meteocons/thunderstorm.svg"; 
  } else if (weatherCode >= 300 && weatherCode < 400) {
    //Showers
    return isDaytime ? "Resources/Meteocons/partly-cloudy-day-drizzle.svg" : "Resources/Meteocons/partly-cloudy-night-drizzle.svg"; 
  } else if (weatherCode >= 500 && weatherCode < 600) {
    //Rain
    return "Resources/Meteocons/rain.svg";  
  } else if (weatherCode >= 600 && weatherCode < 700) {
    //Snow
    return "Resources/Meteocons/snow.svg";  
  } else if (weatherCode >= 700 && weatherCode < 800) {
    //Fog
    return "Resources/Meteocons/fog.svg";  
  } else if (weatherCode === 800) {
    //Clear
    return isDaytime ? "Resources/Meteocons/clear-day.svg" : "Resources/Meteocons/clear-night.svg";
  } else if (weatherCode === 801 || weatherCode === 802) {
    //Cloudy
    return isDaytime ? "Resources/Meteocons/partly-cloudy-day.svg" : "Resources/Meteocons/partly-cloudy-night.svg"; 
  } else if (weatherCode === 803 || weatherCode === 804) {
    //Overcast
    return isDaytime ? "Resources/Meteocons/overcast-day.svg" : "Resources/Meteocons/overcast-night.svg"; 
  } else {
    //NotAviable
    return "Resources/Meteocons/not-available.svg";
  }
}


//Tooltip Show/Hide on Hover
const weatherWidget = document.querySelector('.weather-widget');
const weatherInfo = document.querySelector('.weather-info');

weatherWidget.addEventListener('mousemove', (event) => {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  weatherInfo.style.top = mouseY + 8 + 'px';
  weatherInfo.style.left = mouseX + 8 + 'px';
  weatherInfo.style.visibility = 'visible';
  weatherInfo.style.opacity = 1;
});

weatherWidget.addEventListener('mouseleave', () => {
  weatherInfo.style.visibility = 'hidden';
  weatherInfo.style.opacity = 0;
});
