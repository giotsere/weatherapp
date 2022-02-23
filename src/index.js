require('../dist/output.css');

const key = require('./key');

const dataDiv = document.getElementById('data');
const icon = document.getElementById('icon');
const weatherText = document.getElementById('weather');

let cityData = JSON.parse(localStorage.getItem('cityData')) || '';
let forecastData = JSON.parse(localStorage.getItem('forecastData')) || '';
let input = document.getElementById('input');
input.value = '';
let city = 'new york';

makeRequest();

function gps() {
  let options = {
    enableHighAccuracy: true,
    timeout: 2000,
    maximumAge: 0,
  };

  async function success(pos) {
    let crd = pos.coords;

    const geoResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=${key.API_KEY}`,
      { mode: 'cors' }
    );

    const geoData = await geoResponse.json();
    city = geoData.name;
    loadData();
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

gps();

function makeRequest() {
  async function fetchData() {
    const cityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key.API_KEY}`,
      { mode: 'cors' }
    ).catch((e) => {
      console.log('Error' + e.message);
    });
    cityData = await cityResponse.json().catch((e) => {
      console.log('Error' + e.message);
    });
    localStorage.setItem('cityData', JSON.stringify(cityData));

    return cityData;
  }

  fetchData().then(fetchForecastData);

  async function fetchForecastData() {
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&appid=${key.API_KEY}`,
      { mode: 'cors' }
    ).catch((e) => {
      console.log('Error' + e.message);
    });

    forecastData = await forecastResponse.json().catch((e) => {
      console.log('Error' + e.message);
    });
    localStorage.setItem('forecastData', JSON.stringify(forecastData));
  }

  fetchForecastData().then(displayWeather);
}

function displayWeather() {
  displayMain();
  displayHourly();
  displayDaily();
}

function displayMain() {
  const cityName = document.getElementById('city-name');
  cityName.textContent = cityData.name + ', ' + cityData.sys.country;
  const temp = document.getElementById('temp');
  temp.textContent = convertToCelcius(forecastData.current.temp);

  icon.src = weatherIcon(forecastData.current.weather[0].icon);
  weatherText.textContent = forecastData.current.weather[0].main;
}

function displayHourly() {
  const hourlySection = document.createElement('section');
  hourlySection.classList.add('hourly-section');
  const hourlyDiv = document.createElement('div');
  const hourlyTitle = document.createElement('h3');
  hourlyTitle.textContent = 'Hourly Forcast';
  hourlyTitle.classList.add('hourly-title');
  const currentDiv = document.createElement('div');
  const currentHour = document.createElement('p');
  const currentIcon = document.createElement('img');
  currentIcon.classList.add('icon');
  const currentWeather = document.createElement('p');
  const currentTemp = document.createElement('p');

  currentHour.textContent = convertUnixTimeCurrent(forecastData.current.dt);
  currentIcon.src = icon.src;
  currentWeather.textContent = forecastData.current.weather[0].main;
  currentTemp.textContent = convertToCelcius(forecastData.current.temp);

  currentDiv.appendChild(currentHour);
  currentDiv.appendChild(currentIcon);
  currentDiv.appendChild(currentWeather);
  currentDiv.appendChild(currentTemp);
  currentDiv.classList.add('hourly-card');

  hourlyDiv.appendChild(currentDiv);
  hourlyDiv.classList.add('hourly-div');

  let counter = 1;
  const hourlyData = forecastData.hourly;
  hourlyData.forEach((hour) => {
    if (counter == 25) {
      return;
    }
    let nextDiv = document.createElement('div');

    let nextHour = document.createElement('p');

    nextHour.textContent = convertUnixTime(hour.dt);
    let nextIcon = document.createElement('img');
    nextIcon.classList.add('icon');
    let nextWeather = document.createElement('p');

    nextIcon.src = weatherIcon(hour.weather[0].icon);
    nextWeather.textContent = hour.weather[0].main;

    let nextTemp = document.createElement('p');
    nextTemp.textContent = convertToCelcius(hour.temp);

    nextDiv.appendChild(nextHour);
    nextDiv.appendChild(nextIcon);
    nextDiv.appendChild(nextWeather);
    nextDiv.appendChild(nextTemp);
    nextDiv.classList.add('hourly-card');

    hourlyDiv.appendChild(nextDiv);
    counter++;
  });

  hourlySection.appendChild(hourlyTitle);
  hourlySection.appendChild(hourlyDiv);
  dataDiv.appendChild(hourlySection);
}

function displayDaily() {
  const dailySection = document.createElement('section');
  dailySection.classList.add('daily-section');
  const dailyDiv = document.createElement('div');
  const dailyTitle = document.createElement('h3');
  dailyTitle.textContent = 'Daily Forecast';
  dailyTitle.classList.add('daily-title');
  const dailyData = forecastData.daily;

  dailyData.forEach((day) => {
    const date = convertUnixTimeDate(day.dt);

    let dayDiv = document.createElement('div');
    let dateTitle = document.createElement('p');
    let weather = document.createElement('img');
    weather.classList.add('icon');
    let temp = document.createElement('p');

    dateTitle.textContent = date;
    weather.src = weatherIcon(day.weather[0].icon);
    temp.textContent = convertToCelcius(day.temp.day);

    dayDiv.appendChild(dateTitle);
    dayDiv.appendChild(weather);
    dayDiv.appendChild(temp);
    dayDiv.classList.add('daily-card');

    dailyDiv.appendChild(dayDiv);
  });

  dailySection.appendChild(dailyTitle);
  dailySection.appendChild(dailyDiv);
  dataDiv.appendChild(dailySection);
}

function convertUnixTimeDate(time) {
  const unix_timestamp = time;
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix_timestamp * 1000);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  // Hours part from the timestamp
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();

  let formattedDate;
  return (formattedDate = day + ', ' + month + ', ' + year);
}

function convertUnixTimeCurrent(time) {
  const unix_timestamp = time;
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix_timestamp * 1000);
  // Hours part from the timestamp
  const hours = date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = '0' + date.getSeconds();

  // Will display time in 10:30:23 format
  let formattedTime;
  return (formattedTime =
    hours + ':' + minutes.substring(1) + ':' + seconds.substring(1));
}

function convertUnixTime(time) {
  const unix_timestamp = time;
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unix_timestamp * 1000);
  // Hours part from the timestamp
  const hours = date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = '0' + date.getSeconds();

  // Will display time in 10:30:23 format
  let formattedTime;
  return (formattedTime =
    hours + ':' + minutes.substring(-2) + ':' + seconds.substring(-2));
}

function convertToCelcius(temp) {
  return (temp - 273.15).toFixed(0) + '°C';
}

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    city = input.value;
    loadData();
  }
});

function loadData() {
  clear();
  input.value = '';
  makeRequest();
}

function weatherIcon(code) {
  return `http://openweathermap.org/img/wn/${code}@2x.png`;
}

function clear() {
  dataDiv.textContent = '';
}
