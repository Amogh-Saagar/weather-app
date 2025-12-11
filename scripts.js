const searchInput = document.querySelector(".search-input");
const datalist = document.getElementById("cities");
let mobile_open = false;
let APIkey = localStorage.getItem("APIkey");
if (!APIkey){
    APIkey = prompt("No API Key found! Please enter your API Key.");
    localStorage.setItem("APIkey", APIkey);
}
let currentUnit = 'C';
searchInput.addEventListener("input", function(event) {
    update_preferences();
});

var user =  localStorage.getItem("username");
if (user){
    user = JSON.parse(localStorage.getItem(user));
    document.getElementById("info").innerText = "Hello, " + user.username + "!";
    var hidnele = document.getElementsByClassName("nu")
    for (var i = 0; i < hidnele.length; i++){
        hidnele[i].style.display = "none";
    }
    set_preferences();
}else{
    document.getElementById("info").innerText = "Hello, Guest! Consider Login/Signup for better experience.";
    document.getElementsByClassName("u")[0].style.display = "none";
}


document.querySelector(".search-input").addEventListener("keypress", function(event){
    if (event.key === "Enter"){
        event.preventDefault();
        search(event);
    }
});

function toggleMobileMenu(){
    let nav = document.getElementById("navigation");
    if (mobile_open){
        nav.style.display = "none";
    }else{
        nav.style.display = "flex";
        console.log("opened");
    }
    mobile_open = !mobile_open;
}

async function search(event){
    const loc = searchInput.value;
    if(!loc){
        alert("Please enter a city name.");
        return;
    }
    const APIlink = `https://api.weatherapi.com/v1/current.json?key=${APIkey}&q=${loc}&aqi=no`;
    const response = await fetch(APIlink);
    if(response.status == 403){
        APIkey = prompt("Invalid APIkey! Please enter your API Key.");
        localStorage.setItem("APIkey", APIkey);
    }
    if (response.status != 200){
        alert("City Not Found!");
        return;
    }
    const data = await response.json();
    console.log(JSON.stringify(data));
    curdata = data["current"];
    document.getElementById("main-content").style.display = "grid";
    document.getElementById("city").innerText = data["location"]["name"];
    document.getElementById("region").innerText = data["location"]["region"];
    document.getElementById("condition").innerText = curdata["condition"]["text"];
    document.getElementById("icon").src = "https:" + curdata["condition"]["icon"];
    document.getElementById("content").hidden = false;

    if (currentUnit === 'C') {
        set_celcius();
    } else {
        set_fahrenheit();
    }

    document.getElementById("hum").innerText = "Humidity: " + curdata["humidity"] + " %";
    document.getElementById("uv").innerText = "UV: " + curdata["uv"];
    document.getElementById("cloud").innerText = "Cloud: " + curdata["cloud"] + " %";
    document.getElementById("winspd").innerText = "Wind Speed: " + curdata["wind_kph"] + " kmph";
    document.getElementById("windir").innerText = "Wind Direction: " + curdata["wind_dir"];  
    document.getElementById("vis").innerText = "Visibility: " + curdata["vis_km"] + " km";

    if (user){
        if(user.preferences === "[]"){
            var preferences = [];
        }else{
            var preferences = JSON.parse(user.preferences);
        }
        if (!preferences.includes(loc)){
            preferences.push(loc);
            if(preferences.length > 5){
                preferences.shift();
            }
            user.preferences = JSON.stringify(preferences);
            console.log(user.preferences);
        }else{
            const index = preferences.indexOf(loc);
            preferences.splice(index, 1);
            preferences.push(loc);
            user.preferences = JSON.stringify(preferences);
        }
        localStorage.setItem(user.username, JSON.stringify(user));
    }
}

async function update_preferences(){
    const q = searchInput.value;
    if(!q){
        set_preferences();
        return;
    }
    if (q.length < 1){
        return;
    }
    const APIlink = `https://api.weatherapi.com/v1/search.json?key=${APIkey}&q=${q}&aqi=no`;
    const response = await fetch(APIlink);
    const data = await response.json();
    if(response.status == 403){
        APIkey = prompt("Invalid APIkey! Please enter your API Key.");
        localStorage.setItem("APIkey", APIkey);
    }
    datalist.innerHTML = "";
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item["name"] + ", " + item["region"] + ", " + item["country"];
        datalist.appendChild(option);
    });
    console.log(JSON.stringify(data));
}

function logout(){
    localStorage.removeItem("username");
    alert("You have been logged out.");
    window.location.href = "main.html";
}

function toggleUnit(){
    currentUnit = (currentUnit === 'C') ? 'F' : 'C';
    const btn = document.getElementById('unit-toggle');
    btn.innerText = (currentUnit === 'C') ? '°C' : '°F';
    btn.setAttribute('aria-pressed', currentUnit === 'F');
    if (typeof curdata !== 'undefined') {
        if (currentUnit === 'C') set_celcius();
        else set_fahrenheit();
    }
}

function set_celcius(){
    document.getElementById("temp").innerText = "Temperature: " + curdata["temp_c"] + " \u00B0C";
    document.getElementById("fl").innerText = "Feels Like: " + curdata["feelslike_c"] + " \u00B0C";
    document.getElementById("hi").innerText = "Heat Index: " + curdata["heatindex_c"] + " \u00B0C";  
    document.getElementById("dp").innerText = "Dew Point: " + curdata["dewpoint_c"] + " \u00B0C";  
}

function set_fahrenheit(){
    document.getElementById("temp").innerText = "Temperature: " + curdata["temp_f"] + " \u00B0F";
    document.getElementById("fl").innerText = "Feels Like: " + curdata["feelslike_f"] + " \u00B0F";
    document.getElementById("hi").innerText = "Heat Index: " + curdata["heatindex_f"] + " \u00B0F";  
    document.getElementById("dp").innerText = "Dew Point: " + curdata["dewpoint_f"] + " \u00B0F";  
}

function set_preferences(){
    datalist.innerHTML = "";
    if(user.preferences === "[]"){
        var preferences = [];
    }else{
        var preferences = JSON.parse(user.preferences);
    }
    console.log(preferences);
    preferences
    .reverse()
    .forEach((pref) => {
        const option = document.createElement("option");
        option.value = pref;
        datalist.appendChild(option);
    });
}