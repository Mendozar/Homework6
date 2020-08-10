//GIVEN a weather dashboard with form inputs

//WHEN I search for a city
//THEN I am presented with current and future conditions for that city and that city is added to the search history
$(document).ready(function () {

let apiKey = "6c89694707ac1af1ddc9db51c91da689";
let weather = "";
let city = "";
let latitude;
let longitude;
let current_date = moment().format("L");
let search_history = JSON.parse(localStorage.getItem("cities")) === null ? [] : JSON.parse(localStorage.getItem("cities"));


//WHEN I open the weather dashboard
//THEN I am presented with the last searched city forecast
displaySearchHistory();


function currentWeather() {

    //If the search button is clicked
    //Then store the text in the search bar to the city variable
    if ($(this).attr("id") === "submit-city") {
        city = $("#city").val();
    } else {
        city = $(this).text();
    }

    //Store the URL to the OpenWeather API page of the city with the API Key
    weather = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;

    //
    if (search_history.indexOf(city) === -1) {

        search_history.push(city);
    }

    //Store search history into local storage with "cities"
    localStorage.setItem("cities", JSON.stringify(search_history));

//WHEN I view current weather conditions for that city
//THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index

    //Get the weather object, return as json
    $.getJSON(weather, function (json) {
        //return the temp and convert temperature to F
        let temp = (json.main.temp - 273.15) * (9 / 5) + 32;
        //Convert the windspeed to MPH
        let windspeed = json.wind.speed * 2.237;

        //Display the following values to the page for the selected city on the current day
        //the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
        $("#current-city").text(json.name + " " + current_date);
        $("#weather-img").attr("src", "https://openweathermap.org/img/w/" + json.weather[0].icon + ".png");
        $("#temperature").text(temp.toFixed(2) + "°F");
        $("#humidity").text(json.main.humidity + "%");
        $("#windspeed").text(windspeed.toFixed(2) + " " + "mph");

        latitude = weather.coord.lat;
        longitude = weather.coord.lon;

        var queryURL3 = "https://api.openweathermap.org/data/2.5/uvi/forecast?&units=imperial&appid=885e9149105e8901c9809ac018ce8658&q=" +
        "&lat=" +
        latitude +
        "&lon=" +
        longitude;

      $.ajax({
        url: queryURL3,
        method: "GET"
      }).then(function(uvIndex) {

        let uvIndexDisplay = $("<button>");
        uvIndexDisplay.addClass("btn btn-danger");

        $("#current-uv").text("UV Index: ");
        $("#current-uv").append(uvIndexDisplay.text(uvIndex[0].value));

//WHEN I view the UV index
//THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe









    });
}

//WHEN I view future weather conditions for that city
//THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity

function fiveDayForecast() {
    let five_day_forecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&APPID=" + apiKey;
   
    let day_counter = 1;

    $.ajax({
        url: five_day_forecast,
        method: "GET"
    }).then(function (response) {


        for (let i = 0; i < response.list.length; i++) {
            //change each text area here
            let date_and_time = response.list[i].dt_txt;
            let date = date_and_time.split(" ")[0];
            let time = date_and_time.split(" ")[1];

            if (time === "15:00:00") {
                let year = date.split("-")[0];
                let month = date.split("-")[1];
                let day = date.split("-")[2];
                $("#day-" + day_counter).children(".card-date").text(month + "/" + day + "/" + year);
                $("#day-" + day_counter).children(".weather-icon").attr("src", "https://api.openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                $("#day-" + day_counter).children(".weather-temp").text("Temp: " + ((response.list[i].main.temp - 273.15) * (9 / 5) + 32).toFixed(2) + "°F");
                $("#day-" + day_counter).children(".weather-humidity").text("Humidity: " + response.list[i].main.humidity + "%");
                day_counter++;
            }
        }
    });
}

//WHEN I click on a city in the search history
//THEN I am again presented with current and future conditions for that city

function displaySearchHistory() {

    $("#search-history").empty();
    search_history.forEach(function (city) {


        let history_item = $("<li>");

        history_item.addClass("list-group-item btn btn-light");
        history_item.text(city);

        $("#search-history").prepend(history_item);
    });
    $(".btn").click(currentWeather);
    $(".btn").click(fiveDayForecast);

}

    function clearHistory() {
        $("#search-history").empty();
        search_history = [];
        localStorage.setItem("cities", JSON.stringify(search_history));
    }



    //put the listener on btn class so that all buttons have listener
    $("#clear-history").click(clearHistory);
    $("#submit-city").click(displaySearchHistory);

});