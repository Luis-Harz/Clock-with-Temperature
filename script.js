
const digitalClock = document.querySelector(".digital-clock");
const dateDisplay = document.querySelector(".date-display");
const weatherDisplay = document.querySelector(".weather-display");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const canvas = document.getElementById("analog-clock");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.15, 200);
    canvas.width = size;
    canvas.height = size;
}


if (localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}


themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");
    themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});


function updateClock() {
    const now = new Date();
    digitalClock.textContent = now.toLocaleTimeString();

    // Datum formatieren: 25.03.2025
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    dateDisplay.textContent = `${day}.${month}.${year}`;

    drawAnalogClock(now);
}


function drawAnalogClock(time) {
    resizeCanvas();
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `${radius * 0.15}px Poppins`;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 1; i <= 12; i++) {
        const angle = ((i / 12) * Math.PI * 2) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * 0.85);
        const y = centerY + Math.sin(angle) * (radius * 0.85);
        ctx.fillText(i, x, y);
    }

    const secAngle = ((time.getSeconds() / 60) * 360) * (Math.PI / 180);
    const minAngle = ((time.getMinutes() / 60) * 360 + (time.getSeconds() / 60) * 6) * (Math.PI / 180);
    const hourAngle = ((time.getHours() % 12) / 12 * 360 + (time.getMinutes() / 60) * 30) * (Math.PI / 180);

    drawHand(centerX, centerY, radius * 0.5, hourAngle, 6);
    drawHand(centerX, centerY, radius * 0.7, minAngle, 4);
    drawHand(centerX, centerY, radius * 0.9, secAngle, 2, "red");
}


function drawHand(x, y, length, angle, width, color = "black") {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
        x + length * Math.cos(angle - Math.PI / 2),
        y + length * Math.sin(angle - Math.PI / 2)
    );
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.stroke();
}


function fetchWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = data.current_weather.temperature;
            weatherDisplay.textContent = `${temp}°C`;
        })
        .catch(() => weatherDisplay.textContent = "Wetter nicht verfügbar");
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => weatherDisplay.textContent = "Standort nicht verfügbar"
    );
}

setInterval(updateClock, 1000);
updateClock();
