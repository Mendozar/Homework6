//GIVEN a weather dashboard with form inputs

function openDashboard() {
    
    //Open Weather API Key.
    const APIKey = "6c89694707ac1af1ddc9db51c91da689";

    //Store the DOM path to the elements in the Search section.
    var cityInput = document.getElementById("city-input");
    var searchButton = document.getElementById("search-button");
    var clearButton = document.getElementById("clear-history");
    var searchHistoryDiv = document.getElementById("history");

    //Store the previous city searches to localstorage.
    var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    //Store the DOM path to the elements for the selected city's current weather metrics.
    var chosenCityName = document.getElementById("city-name");
    var chosenCityPic = document.getElementById("current-pic");
    var chosenCityTemp = document.getElementById("temperature");
    var chosenCityHumidity = document.getElementById("humidity");
    var chosenCityWind = document.getElementById("wind-speed");
    var chosenCityUV = document.getElementById("UV-index");


    function returnWeather(cityName) {

        //Store the query url for the selected city and the API Key
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        
        //Get the response object from the OpenWeather Current Weather Data API given the query URL
        $.ajax({
            url: queryURL,
            method: "GET"
          }).then(function(response){

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
            chosenCityName.innerHTML = response.name + " (" + month + "/" + day + "/" + year + ") ";
            var weatherPic = response.weather[0].icon;
            chosenCityPic.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            chosenCityPic.setAttribute("alt",response.weather[0].description);
            chosenCityTemp.innerHTML = "Temperature: " + convertTemp(response.main.temp) + " &#176F";
            chosenCityHumidity.innerHTML = "Humidity: " + response.main.humidity + "%";
            chosenCityWind.innerHTML = "Wind Speed: " + response.wind.speed + " MPH";

        //Store the lat and long of the city
        var lat = response.coord.lat;
        var lon = response.coord.lon;

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

            //Display the UV Index for the selected city on the 
            //current day in the UV Div via a newly created span
            var UVIndex = document.createElement("span");
            UVIndex.setAttribute("class","badge badge-danger");
            UVIndex.innerHTML = response[0].value;
            chosenCityUV.innerHTML = "UV Index: ";
            chosenCityUV.append(UVIndex);
        });

        //WHEN I view future weather conditions for that city
        //THEN I am presented with a 5-day forecast that displays 
        //the date, an icon representation of weather conditions, the temperature, and the humidity

        //Store the URL for the Open Weather 5 day / 3 hour Forecast api
        var cityID = response.id;
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

                //Calculate the index needed for each future date
                var forecastIndex = i*8 + 4;
                var forecastDate = new Date(response.list[forecastIndex].dt * 1000);

                //Return the Date, Month and Year
                var forecastDay = forecastDate.getDate();
                var forecastMonth = forecastDate.getMonth() + 1;
                var forecastYear = forecastDate.getFullYear();

                //Populate a <p> with that Date, Month and Year
                var forecastDateEl = document.createElement("p");
                forecastDateEl.setAttribute("class","forecast-date");
                forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastEls[i].append(forecastDateEl);
                
                //Populate an <img> with the icon for that particular day and include the icon for the forcasted weather that date
                var forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response.list[forecastIndex].weather[0].description);
                forecastEls[i].append(forecastWeatherEl);
                
                //Populate a <p> with the forecasted temperature that date.
                var forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp: " + convertTemp(response.list[forecastIndex].main.temp) + " &#176F";
                forecastEls[i].append(forecastTempEl);
                
                //Populate a <p> with the forecasted humidity that date.
                var forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response.list[forecastIndex].main.humidity + "%";
                forecastEls[i].append(forecastHumidityEl);

                }
            })
        });  
    }

    //When the search button is clicked
    searchButton.addEventListener("click",function() {

        //Store the string from the search field
        var searchTerm = cityInput.value;
        
        //Run the returnWeather function with the searchTerm input.
        returnWeather(searchTerm);
        
        //Push this searchTerm to the end of the localstorage searchHistory array
        searchHistory.push(searchTerm);
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    //When the clear history button is clicked
    clearButton.addEventListener("click",function() {

        //Clear out the searchHistory array
        searchHistory = [];
        //Run the renderSearchHistory Function
        renderSearchHistory();

    })

    //Convert the temperature from Kelvin to Fahrenheit
    function convertTemp(K) {
        return Math.floor((1.8 *(K - 273.15)) + 32);
    }

    //Display the previous searchTerms below the search field.
    function renderSearchHistory() {
        
        //Start by updating the search list to blank text string.
        searchHistoryDiv.innerHTML = "";

        //Display each element within the searchHistory array.
        for (var i=0; i < searchHistory.length; i++) {
            
            //Create an input element with readonly text
            //Display the value in each element of the searchHistory array
            var searchItemHistory = document.createElement("input");
            searchItemHistory.setAttribute("type","text");
            searchItemHistory.setAttribute("readonly",true);
            searchItemHistory.setAttribute("class", "form-control d-block");
            searchItemHistory.setAttribute("value", searchHistory[i]);

            //When any of the cities in the searchHistory is selected
            //Update the current and 5 day forecasts.
            searchItemHistory.addEventListener("click",function() {
                //Run the returnWeather function with the value in searchItemHistory
                returnWeather(searchItemHistory.value);
            })

            //Append all of the items searched
            searchHistoryDiv.append(searchItemHistory);
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