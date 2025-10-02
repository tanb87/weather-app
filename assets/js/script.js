function start() {

    // OpenWeather API Key
    const apiKey = "991bed0f19c582d528c3f6f90605ec42";
  
    // OpenWeather API endpoints
    let api1 = "https://api.openweathermap.org/data/2.5/weather?q="
    let api2 = "https://api.openweathermap.org/data/2.5/onecall?lat="
    let api3 = "https://api.openweathermap.org/data/2.5/forecast?q="
  
    // Google API key
  
    const apiKey2 = "AIzaSyBnT-rCeUngtUfKTUEsF0PZMbyRW9Glk8A";
  
    // Google API Endpoints
    let api4 = "https://www.google.com/maps/embed/v1/place?q=";
    
    // Search input + button
    let userSearch = document.getElementById("user-input");
    let searchButton = document.getElementById("user-search");
  
    // Display elements
    let citynameField = document.getElementById("city-name");
    let weatherIcon = document.getElementById("weather-icon");
    let weatherField = document.getElementById("weather-field");
    let temperatureField = document.getElementById("temperature-field");
    let humidityField  = document.getElementById("humidity-field");
    let windspeedField = document.getElementById("windspeed-field");
    let uvindexField = document.getElementById("uvindex-field");
    let sunriseField = document.getElementById("sunrise-field");
    let sunsetField = document.getElementById("sunset-field");
    let mapField = document.getElementById("map");
    
    // Saves user searches into an empty array
    let saveField = document.getElementById("history-field");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);
  
    // This checks the user input if empty
    searchButton.addEventListener("click",function() {
        let searchTerm = userSearch.value;
  
        if (userSearch.value === "") {
            alert("Please enter a valid city name");
            return;
  
        // else, proceed to save
        } else {
            callOpenWeather(searchTerm);
            searchHistory.push(searchTerm);
            localStorage.setItem("search",JSON.stringify(searchHistory));
            displayHistory();
        }
  
    })
  
    // This initializes the unit of measurement selector 
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('select');
        var instances = M.FormSelect.init(elems);
    });
  
    // This initializes the 5-day carousel
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('.carousel');
        var instances = M.Carousel.init(elems);
      });
  
    // This function displays the search histories
    function displayHistory() {
        saveField.innerHTML = "";
        for (let i=0; i<searchHistory.length; i++) {
            let pastSearch = document.createElement("input");
            pastSearch.setAttribute("type","text");
            pastSearch.setAttribute("readonly",true);
            pastSearch.setAttribute("class", "form-control d-block bg-white");
            pastSearch.setAttribute("value", searchHistory[i]);
            pastSearch.addEventListener("click",function() {
                callOpenWeather(pastSearch.value);
            })
            saveField.append(pastSearch);
        }
    }
  
    displayHistory();
    if (searchHistory.length > 0) {
        callOpenWeather(searchHistory[searchHistory.length - 1]);
    }
  
    // Search starts here
    function callOpenWeather(cityName) {
  
        // Units of measurement
        let userUnit = document.getElementById("unit-measurement");
            
        let unitsSelect = userUnit.value;
  
        // Units of measurement Symbols
        if (userUnit.value == "imperial") {
            var unitTemp = "&#176F"
            var unitSpeed = "mph"
  
        } else if (userUnit.value == "standard") {
            var unitTemp = "&#8490"
            var unitSpeed = "m/s"
  
        } else if (userUnit.value == "metric") {
            var unitTemp = "&#8451"
            var unitSpeed = "m/s"
  
        }
  
        // OpenWeather Call
        let call1 = api1 + cityName + "&units=" + unitsSelect + "&appid=" + apiKey;
  
        // Google Call
        let googleCall = api4 + cityName + "&key=" + apiKey2;
  
        fetch (call1)
  
        .then(function(response){
            return response.json();
        })
  
        .then(function(response) {
  
            // Determine the searchDate using MomentJS
            let searchDate = moment().format('L');
  
            // Display City Name and searchDate
            citynameField.innerHTML = response.name + " (" + searchDate + ")";
  
            // Display the Weather Icon
            let weatherThumb = response.weather[0].icon;
            weatherIcon.setAttribute("src","https://openweathermap.org/img/wn/" + weatherThumb + "@2x.png");
  
            // Determine the weather condition
            let weatherCondition = response.weather[0].main
  
            // Display weather condition to support the weather icon
            weatherField.innerHTML = weatherCondition;
  
            // Display Temperature
            temperatureField.innerHTML = "Temperature: "+ response.main.temp + unitTemp;
  
            // Display Map
            mapField.setAttribute("src",googleCall);
            mapField.setAttribute("class", "z-depth-4")
  
            // Display Humidity
            humidityField.innerHTML = "Humidity: "+ response.main.humidity + "%";
  
            // Display Wind Speed
            windspeedField.innerHTML = "Wind Speed: "+ response.wind.speed + unitSpeed;
  
            // Display Sunrise/Sunset Logic
            let sunriseSunset = document.getElementById("sunrise-sunset");
  
            if (sunriseSunset.value == "yes") {
  
                //Sunrise
                const sunRise = new Date(response.sys.sunrise*1000);
                const sunriseTime = sunRise.toLocaleTimeString();
                sunriseField.innerHTML = "Sunrise: " + sunriseTime;
  
                //Sunset
                const sunSet = new Date(response.sys.sunset*1000);
                const sunsetTime = sunSet.toLocaleTimeString();
                sunsetField.innerHTML = "Sunset: " + sunsetTime ;
  
            } else {
                sunriseField.innerHTML = "";
                sunsetField.innerHTML = "";
            }
  
            // Make another API call to fetch UV data
            // Start by setting up two required variables
            let lat = response.coord.lat;
            let lon = response.coord.lon;
  
            let call2 = api2 + lat + "&lon=" + lon + "&exclude=hourly,daily" + "&appid=" + apiKey;
  
            return fetch (call2);
  
        })
  
        // Log the UV Data
        .then(function(response2) {
            return response2.json();
        })
  
        .then(function(response2) {
            let uvBadge = document.createElement("span");
  
            // This determines the bg color of the badge
            if (response2.current.uvi >= "6") {
                uvBadge.setAttribute("class","background red");
            } else if (response2.current.uvi >= "3") {
                uvBadge.setAttribute("class","background yellow");
            } else {
                uvBadge.setAttribute("class","background green");
            }
  
            uvBadge.innerHTML = response2.current.uvi;
            uvindexField.innerHTML = "UV Index: ";
            uvindexField.append(uvBadge);
  
            // Make another API call to fetch the 5-Day forecast
            let call3 = api3 + cityName + "&units=" + unitsSelect + "&appid=" + apiKey;
  
            return fetch (call3);
  
        })
        .then(function(response3) {
            return response3.json()
  
        })
  
        // Log the 5-Day forecast Data
        .then(function(response3) {
            let fiveForecast = document.querySelectorAll(".fivedaybadge");
            // For loop to get the number of forecast
            for (i=0; i<fiveForecast.length; i++) {
                fiveForecast[i].innerHTML = "";
                let fivedayCount = i*8 + 4;
  
                // Get the date format for each forecast
                let fivedayDate = new Date(response3.list[fivedayCount].dt * 1000);
                let fivedayMonth = fivedayDate.getMonth() + 1;
                let fivedayDay = fivedayDate.getDate();
                let fivedayYear = fivedayDate.getFullYear();
  
                // Populate the HTML
                let fivedayDateEl = document.createElement("h6");
                fivedayDateEl.setAttribute("class","mt-3 mb-0 fs-4 forecast-date");
                fivedayDateEl.innerHTML = fivedayMonth + "/" + fivedayDay + "/" + fivedayYear;
                fiveForecast[i].append(fivedayDateEl);
  
                // Populate the Temperature
                let forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp:" + response3.list[fivedayCount].main.temp + unitTemp;
                fiveForecast[i].append(forecastTempEl);
  
                // Populate the Humidity
                let forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response3.list[fivedayCount].main.humidity + "%";
                fiveForecast[i].append(forecastHumidityEl);
  
                // Populate the Forecast imgs
                let forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response3.list[fivedayCount].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response3.list[fivedayCount].weather[0].description);
                forecastWeatherEl.setAttribute("class", "blue");
                fiveForecast[i].append(forecastWeatherEl);
  
                
            }
  
        })
  
    }
  
  }
  
  start(); 