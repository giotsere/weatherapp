require('./style.css');

const key = require('./key');

const dataDiv = document.getElementById('data');
const icon = document.getElementById('icon');
const weatherText = document.getElementById('weather');

let cityData = JSON.parse(localStorage.getItem('cityData')) || '';
let forecastData = JSON.parse(localStorage.getItem('forecastData')) || '';
let input = document.getElementById('input');
input.value = '';
let city = 'new york';

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

  /* HTML STRUCTURE
    TODO: 
      CONVERT DT TO DATE/HOUR/MIN
      DISPLAY IT LIKE USUAL

   * section < div < date, icon, temp
   * section  < div < title, humidity | div < feels like 6
   * footer < div < made by, open wether api, icon
   *
   */
}

function displayMain() {
  const cityName = document.getElementById('cityName');
  cityName.textContent = cityData.name;
  const temp = document.getElementById('temp');
  temp.textContent = (forecastData.current.temp - 273.15).toFixed(0) + '°';

  icon.src = weatherIcon(forecastData.current.weather[0].icon);
  weatherText.textContent = forecastData.current.weather[0].main;
}

function displayHourly() {
  const hourlySection = document.createElement('section');
  const hourlyDiv = document.createElement('div');
  const currentDiv = document.createElement('div');
  const currentHour = document.createElement('p');
  const currentIcon = document.createElement('img');
  const currentTemp = document.createElement('p');

  currentHour.textContent = convertUnixTime(forecastData.current.dt);
  currentIcon.src = icon.src;
  currentTemp.textContent =
    (forecastData.current.temp - 273.15).toFixed(0) + '°';

  currentDiv.appendChild(currentHour);
  currentDiv.appendChild(currentIcon);
  currentDiv.appendChild(currentTemp);

  hourlyDiv.appendChild(currentDiv);

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
    let nextWeather = document.createElement('p');

    nextIcon.src = weatherIcon(hour.weather[0].icon);
    nextWeather.textContent = hour.weather[0].main;

    let nextTemp = document.createElement('p');
    nextTemp.textContent = (hour.temp - 273.15).toFixed(0) + '°';

    nextDiv.appendChild(nextHour);
    nextDiv.appendChild(nextIcon);
    nextDiv.appendChild(nextWeather);
    nextDiv.appendChild(nextTemp);

    hourlyDiv.appendChild(nextDiv);
    counter++;
  });

  hourlySection.appendChild(hourlyDiv);
  dataDiv.appendChild(hourlySection);
}

function convertUnixTime(time) {
  let unix_timestamp = time;
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  let date = new Date(unix_timestamp * 1000);
  // Hours part from the timestamp
  let hours = date.getHours();
  // Minutes part from the timestamp
  let minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp
  let seconds = '0' + date.getSeconds();

  // Will display time in 10:30:23 format
  let formattedTime;
  return (formattedTime =
    hours + ':' + minutes.substring(-2) + ':' + seconds.substring(-2));
}

makeRequest();

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    city = input.value;
    clear();
    input.value = '';
    makeRequest();
  }
});

function weatherIcon(code) {
  return `http://openweathermap.org/img/wn/${code}@2x.png`;
}

function clear() {
  dataDiv.textContent = '';
}
