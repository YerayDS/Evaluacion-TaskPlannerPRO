let editingEventId = null;

export async function handleEventSubmit(event) {
  event.preventDefault();

  try {
    const title = document.getElementById("event-title").value.trim();
    const description = document.getElementById("event-desc").value.trim();
    const eventDate = document.getElementById("event-date").value;
    const eventTime = document.getElementById("event-time").value;
    const token = localStorage.getItem("token");

    if (!title || !eventDate || !eventTime) {
      alert("Título, fecha y hora son requeridos");
      return;
    }

    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const eventData = {
      title,
      description,
      eventDate,
      eventTime,
      eventDateTime,
    };

    let response;

    if (editingEventId) {
      response = await fetch(`/api/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });
      editingEventId = null;
    } else {
      response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });
    }

    if (response.ok) {
      loadEvents();
      document.getElementById("event-form").reset();
      document.querySelector("#event-form button").textContent = "Add Event";
    } else {
      alert("No autorizado para guardar el evento.");
    }
  } catch (err) {
    console.error("Error en handleEventSubmit:", err);
  }
}

export async function loadEvents() {
  try {
    const response = await fetch("/api/events");
    const events = await response.json();
    renderEvents(events);
  } catch (err) {
    console.error("Error en loadEvents:", err);
  }
}

async function getWeatherForEvent(event) {
  try {
    const lat = 40.4168;
    const lon = -3.7038;
    const formattedDate = event.eventDate;

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Madrid`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data?.daily?.time) {
      const index = data.daily.time.indexOf(formattedDate);
      if (index !== -1) {
        const maxTemp = data.daily.temperature_2m_max[index];
        const minTemp = data.daily.temperature_2m_min[index];
        const precipitation = data.daily.precipitation_sum[index];
        return `Max: ${maxTemp}°C | Min: ${minTemp}°C | Precip: ${precipitation}mm`;
      } else {
        return "Clima no disponible para esta fecha.";
      }
    } else {
      return "Error obteniendo clima.";
    }
  } catch (err) {
    console.error("Error obteniendo clima:", err);
    return "Error en la API del clima.";
  }
}

async function renderEvents(events = []) {
  const eventList = document.getElementById("event-list");
  const userRole = localStorage.getItem("role");
  eventList.innerHTML = "";

  for (const event of events) {
    const eventItem = document.createElement("div");
    eventItem.classList.add("event-item");

    eventItem.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p><strong>Event Time:</strong> ${event.eventDate} ${event.eventTime}</p>
      <p id="weather-info-${event._id}">Cargando clima...</p>
      ${userRole === "admin" ? `
      <div class="button-container">
        <button onclick="editEvent('${event._id}')">Edit</button>
        <button onclick="deleteEvent('${event._id}')">Delete</button>
      </div>` : ""}
    `;

    eventList.appendChild(eventItem);

    try {
      const weatherText = await getWeatherForEvent(event);
      const weatherInfo = document.getElementById(`weather-info-${event._id}`);
      if (weatherInfo) {
        weatherInfo.textContent = weatherText;
      }
    } catch (err) {
      console.error("Error al obtener el clima:", err);
    }
  }
}

export async function deleteEvent(id) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      loadEvents();
    } else {
      alert("No autorizado para eliminar.");
    }
  } catch (err) {
    console.error("Error en deleteEvent:", err);
  }
}

export async function editEvent(id) {
  try {
    const response = await fetch(`/api/events/${id}`);
    const event = await response.json();

    if (event) {
      document.getElementById("event-title").value = event.title;
      document.getElementById("event-desc").value = event.description;
      document.getElementById("event-date").value = event.eventDate;
      document.getElementById("event-time").value = event.eventTime;

      editingEventId = id;
      document.querySelector("#event-form button").textContent = "Update Event";
    }
  } catch (err) {
    console.error("Error en editEvent:", err);
  }
}
