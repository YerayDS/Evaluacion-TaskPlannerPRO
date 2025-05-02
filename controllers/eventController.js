import { events, saveEvents } from "../models/eventModel.js";
import { getWeatherForEvent } from "../services/weatherService.js";
import { handleError } from "../middlewares/errorHandler.js";

// Función para añadir un nuevo evento
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

// Función para cargar los eventos
export function loadEvents() {
    try {
        renderEvents();
    } catch (err) {
        handleError(err, "loadEvents");
    }
}

// Función para renderizar eventos
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
                <div class="button-container">
                    <button onclick="editEvent(${event.id})">Edit</button>
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                </div>
            `;

            // Obtener el clima para el evento
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

// Función para eliminar un evento
export function deleteEvent(id) {
    try {
        events.splice(0, events.length, ...events.filter(event => event.id !== id));
        saveEvents();
        renderEvents();
    } catch (err) {
        handleError(err, "deleteEvent");
    }
}

// Función para editar un evento
export function editEvent(id) {
    try {
        const event = events.find(event => event.id === id);
        if (event) {
            // Rellenar el formulario con los datos del evento
            document.getElementById("event-title").value = event.title;
            document.getElementById("event-desc").value = event.description;
            document.getElementById("event-date").value = event.eventDate;
            document.getElementById("event-time").value = event.eventTime;

            const eventForm = document.getElementById("event-form");
            const submitButton = eventForm.querySelector("button");
            submitButton.textContent = "Update Event";

            eventForm.onsubmit = function(e) {
                e.preventDefault();
                try {
                    event.title = document.getElementById("event-title").value.trim();
                    event.description = document.getElementById("event-desc").value.trim();
                    event.eventDate = document.getElementById("event-date").value;
                    event.eventTime = document.getElementById("event-time").value;
                    event.eventDateTime = new Date(`${event.eventDate}T${event.eventTime}`); 

                    saveEvents();
                    renderEvents();
                    eventForm.reset();
                    submitButton.textContent = "Add Event"; 
                } catch (err) {
                    handleError(err, "editEvent: update");
                }
            };

            deleteEvent(id);
        }
    } catch (err) {
        handleError(err, "editEvent");
    }
}
