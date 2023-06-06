let searchHistoryElement, cityInputElement, searchButtonElement, currentForecastElement, daysForecastElement;

const API_KEY = "c0cc5fedabca6e33be7252aba31952ec"; // API key

// Load data from local storage if available
const loadLocalStorageData = () => {
    const data = localStorage.getItem("weather-data");
    if (data) document.querySelector(".container-fluid").innerHTML = data;
  
    searchHistoryElement = document.querySelector(".search-history");
    cityInputElement = document.querySelector("#city-input");
    searchButtonElement = document.querySelector("#search-btn");
    currentForecastElement = document.querySelector(".current-forecast");
    daysForecastElement = document.querySelector(".days-forecast");
}

// Create weather card HTML based on weather data
const createWeatherCard = (cityName, weatherItem, index) => {
    const html = `<div class="col mb-3">
        <div class="card border-0 ${index === 0 ? "" : "bg-secondary"} text-white h-100">
        <div class="card-body p-3 ${index === 0 ? "text-dark" : "text-white"}">
            <h5 class="card-title fw-semibold">${index === 0 ? cityName : ""} (${weatherItem.dt_txt.split(" ")[0]})</h5>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather icon">
            <p class="card-text mt-3 mb-2 fs-5">Temp: ${(((weatherItem.main.temp - 273.15) * 9 / 5) + 32).toFixed(2)}°F</p>
            <p class="card-text my-2 fs-5">Wind: ${weatherItem.wind.speed} MPH</p>
            <p class="card-text my-2 fs-5">Humidity: ${weatherItem.main.humidity}%</p>
        </div>
        </div>
    </div>`;
    return html;
}

// Get weather details of passed latitude and longitude
const getWeatherDetails = (cityName, latitude, longitude, addSearchHistory) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const forecastArray = data.list;
        const uniqueForecastDays = new Set();

        const fiveDaysForecast = forecastArray.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 6) {
            uniqueForecastDays.add(forecastDate);
            return true;
            }
            return false;
        });

        cityInputElement.value = "";
        currentForecastElement.innerHTML = "";
        daysForecastElement.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentForecastElement.insertAdjacentHTML("beforeend", html);
            } else {
                daysForecastElement.insertAdjacentHTML("beforeend", html);
            }
        });

        if(addSearchHistory) {
            const buttonHTML = `<button onclick="getCityCoordinates('${cityName}', false)" class="btn btn-secondary py-2 w-100 mt-3">${cityName}</button>`;
            searchHistoryElement.insertAdjacentHTML("afterbegin", buttonHTML);
        }
        
        localStorage.setItem("weather-data", document.querySelector(".container-fluid").innerHTML);
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
};

// Get coordinates of entered city name
const getCityCoordinates = (cityNameParam, addSearchHistory = true) => {
    const cityName = cityNameParam || cityInputElement.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon, addSearchHistory);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

loadLocalStorageData();
searchButtonElement.addEventListener("click", () => getCityCoordinates());