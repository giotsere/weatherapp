const key = require('./key');
let cityData = '' || JSON.parse(localStorage.getItem('cityData'));
let forecastData = '' || JSON.parse(localStorage.getItem('forecastData'));
let lat = '' || cityData.coord.lat;
let lon = '' || cityData.coord.lon;

async function fetchDefaultData() {
  if (cityData != '') {
    if (cityData.name == 'Thessaloniki') {
      lat = cityData.coord.lat;
      lon = cityData.coord.lon;
    }
  } else {
    const cityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=thessaloniki&appid=${key.API_KEY}`,
      { mode: 'cors' }
    );
    cityData = await cityResponse.json();
    localStorage.setItem('cityData', JSON.stringify(cityData));

    lat = cityData.coord.lat;
    lon = cityData.coord.lon;
  }
}

async function fetchForecastData() {
  if (forecastData != '') {
    if (forecastData.lat == lat && forecastData.lon == lon) {
      return;
    }
  } else {
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=40.6403&lon=22.9439&appid=${key.API_KEY}`,
      { mode: 'cors' }
    );

    forecastData = await forecastResponse.json();
    localStorage.setItem('forecastData', JSON.stringify(forecastData));
  }
}

function displayDefault() {}

exports.displayDefault = displayDefault;
