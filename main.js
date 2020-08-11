//GIVEN a weather dashboard with form inputs

function openDashboard() {
    
    //Open Weather API Key
    const APIKey = "6c89694707ac1af1ddc9db51c91da689";

    //Store the DOM path to the elements in the Search section.
    var inputEl = document.getElementById("city-input");
    var searchEl = document.getElementById("search-button");
    var clearEl = document.getElementById("clear-history");
    var historyEl = document.getElementById("history");

    //Store the previous city searches to localstorage
    var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    //Store the DOM path to the elements for the selected city's current weather metrics.
    var nameEl = document.getElementById("city-name");
    var currentPicEl = document.getElementById("current-pic");
    var currentTempEl = document.getElementById("temperature");
    var currentHumidityEl = document.getElementById("humidity");4
    var currentWindEl = document.getElementById("wind-speed");
    var currentUVEl = document.getElementById("UV-index");


    function returnWeather(cityName) {

        //Store the query url for the selected city and the API Key
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        
        //Get the response object from the OpenWeather Current Weather Data API given the query URL
        $.ajax({
            url: queryURL,
            method: "GET"
          })
        .then(function(response){

            response.data = response;
            //Store today's date, day, month & year.
            var currentDate = new Date(response.dt*1000);
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();
            
            //WHEN I search for a city
            //THEN I am presented with current and future conditions for that city and that city is added to the search history
            //WHEN I view current weather conditions for that city
            //THEN I am presented with the city name, the date, 
            //an icon representation of weather conditions, the temperature, 
            //the humidity, the wind speed, and the UV index
            
            //Update the section showing the current day's weather attributes for the currently selected city.
            nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
            var weatherPic = response.data.weather[0].icon;
            currentPicEl.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicEl.setAttribute("alt",response.data.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + convertTemp(response.data.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

        //Store the lat and long of the city
        var lat = response.data.coord.lat;
        var lon = response.data.coord.lon;

        //Store the Query URL for the UV Index API
        var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
              
        //Get the response object from the OpenWeather UV Index API given the query URL
        $.ajax({
            url: UVQueryURL,
            method: "GET"
          })
        .then(function(response){
            
        //WHEN I view the UV index
        //THEN I am presented with 
        //a color that indicates whether 
        //the conditions are favorable, moderate, or severe

            response.data = response;
            //Display the UV Index for the selected city on the current day in the UV Div
            var UVIndex = document.createElement("span");
            UVIndex.setAttribute("class","badge badge-danger");
            UVIndex.innerHTML = response.data[0].value;
            currentUVEl.innerHTML = "UV Index: ";
            currentUVEl.append(UVIndex);
        });

        //WHEN I view future weather conditions for that city
        //THEN I am presented with a 5-day forecast that displays 
        //the date, an icon representation of weather conditions, the temperature, and the humidity

        //Store the URL for the Open Weather 5 day / 3 hour Forecast api
        var cityID = response.data.id;
        var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;

        //Get the response object from the OpenWeather 5 day / 3 hour Forecast API given the query URL
        $.ajax({
            url: forecastQueryURL,
            method: "GET"
          })
        .then(function(response){

            //Display forecast for the next 5 days underneath the section displayin current conditions

            //Store the query selector for all of the 5 divs set aside for future forecasts.
            var forecastEls = document.querySelectorAll(".forecast");

            //For each of the 5 day forecast divs
            //Display the contents of the respective day's forecast metrics
            for (i=0; i<forecastEls.length; i++) {

                //Start by setting each text string to blank
                forecastEls[i].innerHTML = "";
                response.data = response;

                //Calculate the index needed for each future date
                var forecastIndex = i*8 + 4;
                var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);

                //Return the Date, Month and Year
                var forecastDay = forecastDate.getDate();
                var forecastMonth = forecastDate.getMonth() + 1;
                var forecastYear = forecastDate.getFullYear();

                //Populate a <p> with that Date, Month and Year
                var forecastDateEl = document.createElement("p");
                forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastEls[i].append(forecastDateEl);
                
                //Populate an <img> with the icon for that particular day and include the icon for the forcasted weather that date
                var forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
                forecastEls[i].append(forecastWeatherEl);
                
                //Populate a <p> with the forecasted temperature that date.
                var forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp: " + convertTemp(response.data.list[forecastIndex].main.temp) + " &#176F";
                forecastEls[i].append(forecastTempEl);
                
                //Populate a <p> with the forecasted humidity that date.
                var forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                forecastEls[i].append(forecastHumidityEl);

                }
            })
        });  
    }

    //When the search button is clicked
    searchEl.addEventListener("click",function() {
        //Store the string from the search field
        var searchTerm = inputEl.value;
        
        //Run the returnWeather function with the searchTerm input.
        returnWeather(searchTerm);
        
        //Push this searchTerm to the end of the localstorage searchHistory array
        searchHistory.push(searchTerm);
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    //When the clear history button is clicked
    clearEl.addEventListener("click",function() {

        //Clear out the searchHistory array
        searchHistory = [];
        renderSearchHistory();
    })

    //Convert Kelvin to Fahrenheit
    function convertTemp(K) {
        return Math.floor((K - 273.15) *1.8 +32);
    }

    //Display the previous searchTerms below the search field.
    function renderSearchHistory() {
        
        //Start by updating the search list to blank text string.
        historyEl.innerHTML = "";

        //Display each element within the searchHistory array.
        for (var i=0; i<searchHistory.length; i++) {
            
            //Store the DOM path to the search history
            var historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);

            //When the Clear History button is clicked
            historyItem.addEventListener("click",function() {
                //Run the returnWeather function with the value in historyItem
                returnWeather(historyItem.value);
            })

            //Display all of the items searched
            historyEl.append(historyItem);
        }
    }

    //Display the searchHistory
    renderSearchHistory();

    //If localstorage is not empty, then run returnWeather with the last city in the searchHistory array.
    if (searchHistory.length > 0) {
        returnWeather(searchHistory[searchHistory.length - 1]);
    }

}

openDashboard();