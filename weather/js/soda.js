'use strict';

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
var locStore = window.localStorage;
var sessStore = window.sessionStorage;

var pageNav = $('#page-nav');
var statusContainer = $('#status');
var contentContainer = $('#main-content');

/* **********************************
 * Soda Springs Site JavaScript Functions
 ********************************* */

// Let the DOM finish loading
document.addEventListener('DOMContentLoaded', function(){
    buildModDate();

    // Get weather JSON data
    let weatherURL = '/weather/js/idahoweather.json';
    fetchWeatherData(weatherURL);
});

// Hamburger menu
const menuButton = $("#menu");
menuButton.addEventListener('click',function(event){
    const navList = $('#nav');
    const menuBg = $("#menu-bg");
    navList.classList.toggle("change");
    menuButton.classList.toggle("change");
    menuBg.classList.toggle("change-bg");
});

// Shows the date the page was last modified
function buildModDate(){
    const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let lastMod = new Date(document.lastModified);
    const dayName = dayArray[lastMod.getDay()];
    const monthName = monthArray[lastMod.getMonth()];
    const formattedDate = dayName+", "+lastMod.getDate() +" "+monthName+", "+lastMod.getFullYear();
    $('#modDate').innerText = formattedDate;
}

// Calculates and displays wind chill after the 'Feels like:'
function buildWC(speed, temp) {
    let feelTemp = document.getElementById('real-feel');

    // compute wind chill
    let wc = 35.74 + 0.6215 * temp - 35.75 * Math.pow(speed, 0.16) + 0.4275 * temp * Math.pow(speed, 0.16);
    console.log(wc);

    // Round the answer down to an integer
    wc = Math.floor(wc);

    // If wind chill is greater than temp, return the temp
    wc = (wc > temp)?temp:wc;

    // Display the wind chill
    console.log(wc);
    feelTemp.innerHTML = wc;
}

// Time Indicator Function
function timeBall(hour) {
    // Find all 'ball' classes and remove them
    let x = $$('.ball');
    for (let item of x) {
        console.log(item);
        item.classList.remove('ball');
    }

    // Find all hours that match the parameter and add the 'ball' function
    let hr = $$('.i' + hour);
    for (let item of hr) {
        item.classList.add('ball');
    }
}

// Display correct background image based on current condition
function changeSummaryImage(condition) {
    let x = $('#preston-area');

    // Make the conditions all lowercase so it is simpler to deal with input
    let cond = condition.toLowerCase();
    console.log(cond);

    // Check the condition and apply the appropriate image
    switch(true) {
        case /sun/.test(cond):
            x.classList.add('clear');
            break;
        case /rain/.test(cond):
            x.classList.add('rain');
            break;
        case /snow/.test(cond):
            x.classList.add('snow');
            break;
        case /cloud/.test(cond):
            x.classList.add('clouds');
            break;
        case /fog/.test(cond):
            x.classList.add('fog');
    }
}


/* **********************************
 * Fetch Weather Data
 ********************************* */
function fetchWeatherData(weatherURL) {
    let cityName = 'Soda Springs'; // The data we want from the weather.json file
    fetch(weatherURL)
    .then(function(response) {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Network response was not OK.');
    })
    .then(function(data) {
        // Check the data object was retrieved
        console.log(data);
        // data is the full JavaScript object, but we only want the Preston part
        // shorten the variable and focus only on the data we want to reduce typing
        let p = data[cityName];

        // ************* Get the location information *************
        let locName = p.properties.relativeLocation.properties.city;
        let locState = p.properties.relativeLocation.properties.state;
        // Put them together
        let fullName = locName + ', ' + locState;
        // See if it worked, using ticks around the content in the log
        console.log(`fullName is: ${fullName}`);
        // Get the longitude and latitude and combine them to
        // a comma separated single string
        const latLong = p.properties.relativeLocation.geometry.coordinates[1] + ', ' + p.properties.relativeLocation.geometry.coordinates[0];
        console.log(latLong);
        // Create a JSON object containing the full name latitude and longitude
        // and store it into local storage
        const prestonData = JSON.stringify({fullName, latLong});
        locStore.setItem('Preston, ID', prestonData);
        // ************* Get the current conditions information *************
        // As the data is extracted from the JSON, store it into session storage
        sessStore.setItem('fullName', fullName);
        sessStore.setItem('latLong', latLong);
        // Get the tempurature data
        let lowTemp = p.properties.relativeLocation.properties.lowTemp;
        let hiTemp = p.properties.relativeLocation.properties.highTemp;
        let curTemp = p.properties.relativeLocation.properties.temperature;
        sessStore.setItem('lowTemp', lowTemp);
        sessStore.setItem('highTemp', hiTemp);
        sessStore.setItem('temperature', curTemp);
        // Get the wind data
        let speed = p.properties.relativeLocation.properties.windSpeed;
        let gust = p.properties.relativeLocation.properties.windGust;
        sessStore.setItem('windSpeed', speed);
        sessStore.setItem('windGust', gust);
        // Get the hourly data using another function - should include the forecast
        // temp, condition icons and wind speeds. The data will be stored into session
        // storage.
        getHourly(p.properties.forecastHourly);
    })
    .catch(function(error) {
        console.log('There was a fetch problem: ', error.message);
        statusContainer.innerHTML = 'Sorry, the data could not be processed.';
    })
}


/* **********************************
 * Get Hourly Forecast data
 ********************************* */
function getHourly(URL) {
    fetch(URL)
    .then(function(response) {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Response not OK.');
    })
    .then(function(data) {
        console.log('Data from getHourly function:');
        console.log(data); // Let's see what we got back

        // Store 12 hours of data to session storage
        var hourData = [];
        let todayDate = new Date();
        var nowHour = todayDate.getHours();
        console.log(`nowHour is ${nowHour}`);
        for(let i = 0, x = 11; i <= x; i++) {
            if(nowHour < 24) {
                hourData[nowHour] = data.properties.periods[i].temperature + ', ' + data.properties.periods[i].windSpeed + ', ' + data.properties.periods[i].icon;
                sessStore.setItem(`hour${nowHour}`, hourData[nowHour]);
                nowHour++;
            } else {
                nowHour = nowHour - 12;
                hourData[nowHour] = data.properties.periods[i].temperature + ', ' + data.properties.periods[i].windSpeed + ', ' + data.properties.periods[i].icon;
                sessStore.setItem(`hour${nowHour}`, hourData[nowHour]);
                nowHour = 1;
            }
        }

        // Get the shortForcast value from the first hour (the current hour)
        // This will be the condition keyword for setting the background image
        sessStore.setItem('shortForecast', data.properties.periods[0].shortForecast);

        // Call the buildPage function
        buildPage();
    })
    .catch(error => console.log('There was a getHourly error: ', error));
}


/* **********************************
 * Build the Weather page
 ********************************* */
function buildPage() {
    // Set the title with the location name at the first
    // Gets the title element so it can be worked with
    let pageTitle = $('#page-title');
    // Create a text node containing the full name
    let fullNameNode = document.createTextNode(sessStore.getItem('fullName'));
    // Inserts the fullName value before any other content that might exist
    pageTitle.insertBefore(fullNameNode, pageTitle.childNodes[0]);
    // When this is done the title should look something like this:
    // Preston, Idaho | Clouds on Clouds

    // Get the h1 to display the city location
    let contentHeading = $('#contentHeading');
    contentHeading.innerHTML = sessStore.getItem('fullName');
    // The h1 in the main element should now say "Preston, Idaho"

    // Get the coordinates container for the location
    let latLon = $('#latLon');
    latLon.innerHTML = sessStore.getItem('latLong');
    // The latitude and longitude should match what was stored in session storage.

    // Get the condition keyword and set Background picture
    changeSummaryImage(sessStore.getItem('shortForecast'));
    /* Keep in mind that the value may be different than
    what you need for your CSS to replace the image. You
    may need to make some adaptations for it to work.*/

    // ********** Set the current conditions information **********
    // Set the temperature information
    let highTemp = $('#hi');
    let loTemp = $('#lo');
    let currentTemp = $('#curTemp');
    let feelTemp = $('#real-feel');
    highTemp.innerHTML = sessStore.getItem('highTemp');
    loTemp.innerHTML = sessStore.getItem('lowTemp');
    currentTemp.innerHTML = sessStore.getItem('temperature');
    // Set the wind information
    let speed = $('#windSpeed');
    let gust = $('#windGust');
    speed.innerHTML = 'Wind: ' + sessStore.getItem('windSpeed') + 'mph';
    gust.innerHTML = 'Gust: ' + sessStore.getItem('windGust') + 'mph';
    // Calculate feel like temp
    feelTemp.innerHTML = buildWC(sessStore.getItem('windSpeed'), sessStore.getItem('temperature'));

    // ********** Set the Time Indicators **********
    let thisDate = new Date();
    var currentHour = thisDate.getHours();
    let indicatorHour;
    // If hour is greater than 12, subtract 12
    if(currentHour > 12) {
        indicatorHour = currentHour - 12;
    } else {
        indicatorHour = currentHour;
    };
    console.log(`Current hour in time indicator is: ${currentHour}`);
    // Set the time indicator
    timeBall(indicatorHour);

    // ********** Hourly Temperature Component **********
    // Get the hourly data from storage as an array
    let currentData = [];
    let tempHour = currentHour;
    // Adjust counter based on current time
    for (let i = 0, x = 12; i < x; i++) {
        if (tempHour <= 23) {
            currentData[i] = sessStore.getItem('hour' + tempHour).split(',');
            tempHour++;
        } else {
            tempHour = tempHour - 12;
            currentData[i] = sessStore.getItem('hour' + tempHour).split(',');
            console.log(`currentData[i][0] is: ${currentData[i][0]}`);
            tempHour = 1;
        }
    }
    console.log(currentData);

    // Loop through array inserting data
    // Start with the outer container that matches the current time
    tempHour = currentHour;
    for (let i = 0, x = 12; i < x; i++) {
        if (tempHour >= 13) {
            tempHour = tempHour - 12;
        }
        console.log(`Start container is: #temps .o${tempHour}`);
        $('#temps .o' + tempHour).innerHTML = currentData[i][0];
        tempHour++;
    }

    // ********** Hourly Wind Component **********
    // Get the hourly data from storage
    let windArray = [];
    let windHour = currentHour;
    // Adjust counter based on current time
    for (let i = 0, x = 12; i < x; i++) {
        if (windHour <= 23) {
            windArray[i] = currentData[i][1].split(' ');
            console.log(`windArray[i] is: ${windArray[i]}`);
            windHour++;
        } else {
            windHour = windHour - 12;
            windArray[i] = currentData[i][1].split(' ');
            windHour = 1;
        }
    }
    console.log(windArray);

    // Insert Wind data
    // Start with the outer container that matches the time indicator
    windHour = currentHour;
    for (let i = 0, x = 12; i < x; i++) {
        if (windHour >= 13) {
            windHour = windHour - 12;
        }
        $('#wnd .o' + windHour).innerHTML = windArray[i][1];
        windHour++;
    }

    // ********** Condition Component Icons **********
    let conditionHour = currentHour;
    // Adjust counter based on current time
    for (let i = 0, x = 12; i < x; i++) {
        if (conditionHour >= 13) {
            conditionHour = conditionHour - 12;
        }
        $('#futureCond .o' + conditionHour).innerHTML = '<img src="' + currentData[i][2] + '" alt="Hourly weather condition image">';
        conditionHour++;
    }

    // Change the status of the containers
    contentContainer.setAttribute('class', ''); // removes the hide class from main
    statusContainer.setAttribute('class', 'hide'); // hides the status container
}