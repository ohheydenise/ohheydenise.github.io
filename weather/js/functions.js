'use strict';

/* **********************************
 * Weather Site JavaScript Functions
 ********************************* */

// Let the DOM finish loading
document.addEventListener('DOMContentLoaded', function(){
    buildModDate();

    console.log('Wind Chill:');
    // Variables for Wind Chill function
    let temp = 28;
    let speed = 4.8;
    buildWC(speed, temp);

    // Time Indicator function
    console.log('Time Indicator:');
    let hour = 9;
    timeBall(hour);

    // Change Summary Image function
    console.log('Condition:');
    let cond = 'clear';
    changeSummaryImage(cond);
});

// Hamburger menu
const menuButton = document.querySelector("#menu");
menuButton.addEventListener('click',function(event){
    const navList = document.querySelector('#nav');
    const menuBg = document.querySelector("#menu-bg");
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
    document.querySelector('#modDate').innerText = formattedDate;
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
    let x = document.querySelectorAll('.ball');
    for (let item of x) {
        console.log(item);
        item.classList.remove('ball');
    }

    // Find all hours that match the parameter and add the 'ball' function
    let hr = document.querySelectorAll('.i' + hour);
    for (let item of hr) {
        item.classList.add('ball');
    }
}

// Display correct background image based on current condition
function changeSummaryImage(condition) {
    let x = document.querySelector('#preston-area');

    // Make the conditions all lowercase so it is simpler to deal with input
    let cond = condition.toLowerCase();
    console.log(cond);

    // Check the condition and apply the appropriate image
    switch(cond) {
        case 'clear':
            x.classList.add('clear');
            break;
        case 'rain':
            x.classList.add('rain');
            break;
        case 'snow':
            x.classList.add('snow');
            break;
        case 'clouds':
            x.classList.add('clouds');
            break;
        case 'fog':
            x.classList.add('fog');
    }
}