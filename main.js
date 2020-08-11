//GIVEN a weather dashboard with form inputs

function openDashboard() {
    //Open Weather API Key
    const APIKey = "6c89694707ac1af1ddc9db51c91da689";

    //Store the DOM path to the elements in the Search section.
    const inputEl = document.getElementById("city-input");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const historyEl = document.getElementById("history");

    //Store the previous city searches to localstorage
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    //Store the DOM path to the elements for the selected city's current weather metrics.
    const nameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");4
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");


    function getWeather(cityName) {

        //Store the query url for the selected city and the API Key
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        
        //Get the response object from the OpenWeather Current Weather Data API given the query URL
        axios.get(queryURL)
        .then(function(response){

            //Store today's date, day, month & year.
            const currentDate = new Date(response.data.dt*1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            
            //WHEN I search for a city
            //THEN I am presented with current and future conditions for that city and that city is added to the search history
            //WHEN I view current weather conditions for that city
            //THEN I am presented with the city name, the date, 
            //an icon representation of weather conditions, the temperature, 
            //the humidity, the wind speed, and the UV index
            
            //Update the section showing the current day's weather attributes for the currently selected city.
            nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
            let weatherPic = response.data.weather[0].icon;
            currentPicEl.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicEl.setAttribute("alt",response.data.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

        //Store the lat and long of the city
        let lat = response.data.coord.lat;
        let lon = response.data.coord.lon;

        //Store the Query URL for the UV Index API
        let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
              
        //Get the response object from the OpenWeather UV Index API given the query URL
        axios.get(UVQueryURL)
        .then(function(response){
            
        //WHEN I view the UV index
        //THEN I am presented with 
        //a color that indicates whether 
        //the conditions are favorable, moderate, or severe

            //Display the UV Index for the selected city on the current day in the UV Div
            let UVIndex = document.createElement("span");
            UVIndex.setAttribute("class","badge badge-danger");
            UVIndex.innerHTML = response.data[0].value;
            currentUVEl.innerHTML = "UV Index: ";
            currentUVEl.append(UVIndex);
        });

        //WHEN I view future weather conditions for that city
        //THEN I am presented with a 5-day forecast that displays 
        //the date, an icon representation of weather conditions, the temperature, and the humidity

        //Store the URL for the Open Weather 5 day / 3 hour Forecast api
        let cityID = response.data.id;
        let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;

        //Get the response object from the OpenWeather 5 day / 3 hour Forecast API given the query URL
        axios.get(forecastQueryURL)
        .then(function(response){

            //Display forecast for the next 5 days underneath the section displayin current conditions

            //Store the query selector for all of the 5 divs set aside for future forecasts.
            const forecastEls = document.querySelectorAll(".forecast");

            //For each of the 5 day forecast divs
            //Display the contents of the respective day's forecast metrics
            for (i=0; i<forecastEls.length; i++) {

                //Start by setting each text string to blank
                forecastEls[i].innerHTML = "";

                //Calculate the index needed for each future date
                const forecastIndex = i*8 + 4;
                const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);

                //Return the Date, Month and Year
                const forecastDay = forecastDate.getDate();
                const forecastMonth = forecastDate.getMonth() + 1;
                const forecastYear = forecastDate.getFullYear();

                //Populate a <p> with that Date, Month and Year
                const forecastDateEl = document.createElement("p");
                forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastEls[i].append(forecastDateEl);
                
                //Populate an <img> with the icon for that particular day and include the icon for the forcasted weather that date
                const forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
                forecastEls[i].append(forecastWeatherEl);
                
                //Populate a <p> with the forecasted temperature that date.
                const forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                forecastEls[i].append(forecastTempEl);
                
                //Populate a <p> with the forecasted humidity that date.
                const forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                forecastEls[i].append(forecastHumidityEl);

                }
            })
        });  
    }

    //When the search button is clicked
    searchEl.addEventListener("click",function() {
        //Store the string from the search field
        const searchTerm = inputEl.value;
        
        //Run the getWeather function with the searchTerm input.
        getWeather(searchTerm);
        
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
    function k2f(K) {
        return Math.floor((K - 273.15) *1.8 +32);
    }

    //Display the previous searchTerms below the search field.
    function renderSearchHistory() {
        
        //Start by updating the search list to blank text string.
        historyEl.innerHTML = "";

        //Display each element within the searchHistory array.
        for (let i=0; i<searchHistory.length; i++) {
            
            //Store the DOM path to the search history
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);

            //When the Clear History button is clicked
            historyItem.addEventListener("click",function() {
                //Run the getWeather function with the value in historyItem
                getWeather(historyItem.value);
            })

            //Display all of the items searched
            historyEl.append(historyItem);
        }
    }

    //Display the searchHistory
    renderSearchHistory();

    //If localstorage is not empty, then run getWeather with the last city in the searchHistory array.
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }

}

openDashboard();