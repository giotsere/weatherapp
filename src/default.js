const key = require('./key');
const icons = require('./icons');
let cityData = JSON.parse(localStorage.getItem('cityData')) || '';
let forecastData = JSON.parse(localStorage.getItem('forecastData')) || '';
let lat, lon;

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
    ).catch((e) => {
      console.log('Error' + e.message);
    });
    cityData = await cityResponse.json().catch((e) => {
      console.log('Error' + e.message);
    });
    localStorage.setItem('cityData', JSON.stringify(cityData));

    lat = cityData.coord.lat;
    lon = cityData.coord.lon;

    return cityData;
  }
}

fetchDefaultData().then(fetchForecastData);

async function fetchForecastData() {
  if (forecastData != '') {
    if (forecastData.lat == lat && forecastData.lon == lon) {
      return;
    }
  } else {
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=40.6403&lon=22.9439&appid=${key.API_KEY}`,
      { mode: 'cors' }
    ).catch((e) => {
      console.log('Error' + e.message);
    });

    forecastData = await forecastResponse.json().catch((e) => {
      console.log('Error' + e.message);
    });
    localStorage.setItem('forecastData', JSON.stringify(forecastData));

    return forecastData;
  }
}

fetchForecastData().then(displayDefault);

function displayDefault() {
  //MAIN
  const main = document.createElement('main');
  const cityTitle = document.createElement('h1');
  cityTitle.textContent = cityData.name;
  const mainDiv = document.createElement('div');
  const temp = document.createElement('p');
  temp.textContent = (forecastData.current.temp - 273.15).toFixed(0) + '°';
  const icon = document.createElement('img');
  const searchBox = document.createElement('input');
  searchBox.placeholder = 'Search...';

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

  mainDiv.appendChild(icon);
  mainDiv.appendChild(temp);
  main.appendChild(cityTitle);
  main.appendChild(mainDiv);
  main.appendChild(searchBox);
  document.body.appendChild(main);

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

  const hourlyData = forecastData.hourly;
  hourlyData.forEach((hour) => {
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
  });

  hourlySection.appendChild(hourlyDiv);
  document.body.appendChild(hourlySection);

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

exports.displayDefault = displayDefault;
