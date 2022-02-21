require('./style.css');

const key = require('./key');
const icons = require('./icons');
let cityData = JSON.parse(localStorage.getItem('cityData')) || '';
let forecastData = JSON.parse(localStorage.getItem('forecastData')) || '';
let input = document.getElementById('input');
input.value = '';
let city = 'new york';
const dataDiv = document.getElementById('data');

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

  fetchForecastData().then(displayDefault);
}

function displayDefault() {
  //MAIN
  const cityName = document.getElementById('cityName');
  cityName.textContent = cityData.name;
  const temp = document.getElementById('temp');
  temp.textContent = (forecastData.current.temp - 273.15).toFixed(0) + '°';
  const icon = document.getElementById('icon');

  switch (forecastData.current.weather[0].main) {
    case 'Clouds':
      icon.src = icons.cloud;
      break;
    case 'Clear':
      icon.src = icons.sun;
      break;
    case 'Rain':
      icon.src = icons.rain;
      break;
  }

  // HOURLY WEATHER
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

    switch (hour.weather[0].main) {
      case 'Clouds':
        nextIcon.src = icons.cloud;
        break;
      case 'Clear':
        nextIcon.src = icons.sun;
        break;
      case 'Rain':
        nextIcon.src = icons.rain;
        break;
    }
    let nextTemp = document.createElement('p');
    nextTemp.textContent = (hour.temp - 273.15).toFixed(0) + '°';

    nextDiv.appendChild(nextHour);
    nextDiv.appendChild(nextIcon);
    nextDiv.appendChild(nextTemp);

    hourlyDiv.appendChild(nextDiv);
    counter++;
  });

  hourlySection.appendChild(hourlyDiv);
  dataDiv.appendChild(hourlySection);

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

function clear() {
  dataDiv.textContent = '';
}
