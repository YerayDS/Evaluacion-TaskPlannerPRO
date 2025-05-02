import { events, saveEvents } from "../models/eventModel.js";
import { getWeatherForEvent } from "../services/weatherService.js";
import { handleError } from "../middlewares/errorHandler.js";

export function handleEventSubmit(event) {
    event.preventDefault();

    try {
        const title = document.getElementById("event-title").value.trim();
        const description = document.getElementById("event-desc").value.trim();
        const eventDate = document.getElementById("event-date").value;
        const eventTime = document.getElementById("event-time").value;

        if (!title || !eventDate || !eventTime) {
            alert("Título, fecha y hora son requeridos");
            return;
        }

        const eventDateTime = new Date(`${eventDate}T${eventTime}`);

        const newEvent = {
            id: Date.now(),
            title,
            description,
            eventDateTime,
            eventDate,
            eventTime
        };

        events.push(newEvent);
        saveEvents();
        renderEvents();

        document.getElementById("event-form").reset();
    } catch (err) {
        handleError(err, "handleEventSubmit");
    }
}

export function loadEvents() {
    try {
        renderEvents();
    } catch (err) {
        handleError(err, "loadEvents");
    }
}

function renderEvents() {
    try {
        const eventList = document.getElementById("event-list");
        eventList.innerHTML = "";

        events.sort((a, b) => a.eventDateTime - b.eventDateTime);

        events.forEach(event => {
            const eventItem = document.createElement("div");
            eventItem.classList.add("event-item");

            eventItem.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Event Time:</strong> ${event.eventDate} ${event.eventTime}</p>
                <p id="weather-info-${event.id}">Cargando clima...</p>
            `;

            getWeatherForEvent(event)
                .then(weatherText => {
                    const weatherInfo = document.getElementById(`weather-info-${event.id}`);
                    if (weatherInfo) weatherInfo.textContent = weatherText;
                })
                .catch(err => {
                    handleError(err, "getWeatherForEvent");
                });

            eventList.appendChild(eventItem);
        });
    } catch (err) {
        handleError(err, "renderEvents");
    }
}