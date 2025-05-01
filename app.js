
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let events = JSON.parse(localStorage.getItem("events")) || [];

const apiKey = '5f4ec6a1f0b745eca5157c7977a45f1a'; 

function addTask(event) {
    event.preventDefault();

    try {
        const title = document.getElementById("task-title").value.trim();
        const description = document.getElementById("task-desc").value.trim();
        const dueDate = document.getElementById("task-date").value;
        const status = document.getElementById("task-status").value;

        if (!title || !dueDate) {
            alert("Titulo y fecha son requeridos");
            return;
        }

        const taskDate = new Date(dueDate);

        const newTask = {
            id: Date.now(),
            title,
            description,
            dueDate,
            status,
            taskDate
        };

        console.log("Nueva tarea creada: ", newTask);

        tasks.push(newTask);

        try {
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } catch (err) {
            console.error("Error guardando tasks en localStorage:", err);
        }

        renderTasks();
        document.getElementById("task-form").reset();

    } catch (err) {
        console.error("Error en addTask:", err);
    }
}

function loadTasks() {
    renderTasks();
}

function renderTasks(filter = "all") {
    try {
        const pendingList = document.getElementById("pending-tasks");
        const inProgressList = document.getElementById("inprogress-tasks");
        const completedList = document.getElementById("completed-tasks");

        const pendingColumn = document.getElementById("pending-column");
        const inProgressColumn = document.getElementById("inprogress-column");
        const completedColumn = document.getElementById("completed-column");
        const taskContainer = document.querySelector(".task-columns");

        pendingList.innerHTML = "";
        inProgressList.innerHTML = "";
        completedList.innerHTML = "";

        let filteredTasks = tasks;
        if (filter !== "all") {
            filteredTasks = tasks.filter(task => task.status === filter);
        }

        pendingColumn.classList.add("hidden");
        inProgressColumn.classList.add("hidden");
        completedColumn.classList.add("hidden");

        if (filter === "all" || filter === "pending") {
            pendingColumn.classList.remove("hidden");
            filteredTasks
                .filter(task => task.status === "pending")
                .forEach(task => appendTaskToColumn(pendingList, task));
        }
        if (filter === "all" || filter === "inprogress") {
            inProgressColumn.classList.remove("hidden");
            filteredTasks
                .filter(task => task.status === "inprogress")
                .forEach(task => appendTaskToColumn(inProgressList, task));
        }
        if (filter === "all" || filter === "completed") {
            completedColumn.classList.remove("hidden");
            filteredTasks
                .filter(task => task.status === "completed")
                .forEach(task => appendTaskToColumn(completedList, task));
        }

        const visibleColumns = document.querySelectorAll(".task-column:not(.hidden)");
        if (visibleColumns.length === 1) {
            visibleColumns[0].classList.add("centered");
        } else {
            document.querySelectorAll(".task-column").forEach(col => col.classList.remove("centered"));
        }
    } catch (err) {
        console.error("Error en renderTasks:", err);
    }
}

function filterTasks() {
    try {
        const filterValue = document.getElementById("task-filter").value;
        renderTasks(filterValue);
    } catch (err) {
        console.error("Error en filterTasks:", err);
    }
}

function appendTaskToColumn(taskListElement, task) {
    try {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        taskItem.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <select onchange="updateStatus(${task.id}, this.value)">
                <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
                <option value="inprogress" ${task.status === "inprogress" ? "selected" : ""}>In Progress</option>
                <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
            </select>
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskListElement.appendChild(taskItem);
    } catch (err) {
        console.error("Error en appendTaskToColumn:", err);
    }
}

function updateStatus(id, newStatus) {
    try {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks(document.getElementById("task-filter").value);
        }
    } catch (err) {
        console.error("Error en updateStatus:", err);
    }
}

function deleteTask(id) {
    try {
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks(document.getElementById("task-filter").value);
    } catch (err) {
        console.error("Error en deleteTask:", err);
    }
}

function editTask(id) {
    try {
        const task = tasks.find(task => task.id === id);
        if (task) {
            document.getElementById("task-title").value = task.title;
            document.getElementById("task-desc").value = task.description;
            document.getElementById("task-date").value = task.dueDate;
            document.getElementById("task-status").value = task.status;
            deleteTask(id);
        }
    } catch (err) {
        console.error("Error en editTask:", err);
    }
}

function addEvent(event) {
    event.preventDefault();

    try {
        const title = document.getElementById("event-title").value.trim();
        const description = document.getElementById("event-desc").value.trim();
        const eventDate = document.getElementById("event-date").value;
        const eventTime = document.getElementById("event-time").value;

        if (!title || !eventDate || !eventTime) {
            alert("Titulo, fecha y hora son requeridos en los eventos");
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

        console.log("Nuevo evento creado: ", newEvent);

        events.push(newEvent);

        localStorage.setItem("events", JSON.stringify(events));

        renderEvents();

        document.getElementById("event-form").reset();
    } catch (err) {
        console.error("Error en addEvent:", err);
    }
}

function loadEvents() {
    try {
        renderEvents();
    } catch (err) {
        console.error("Error en loadEvents:", err);
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
                <div class="button-container">
                    <button onclick="editEvent(${event.id})">Edit</button>
                    <button onclick="deleteEvent(${event.id})">Delete</button>
                </div>
            `;

            try {
                getWeatherForEvent(event, (weatherText) => {
                    const weatherInfoElement = document.getElementById(`weather-info-${event.id}`);
                    if (weatherInfoElement) {
                        weatherInfoElement.textContent = weatherText;
                    }
                });
            } catch (err) {
                console.error(`Error obteniendo clima para evento ${event.id}:`, err);
            }

            eventList.appendChild(eventItem);
        });
    } catch (err) {
        console.error("Error en renderEvents:", err);
    }
}

function deleteEvent(id) {
    try {
        events = events.filter(event => event.id !== id);
        localStorage.setItem("events", JSON.stringify(events));
        renderEvents();
    } catch (err) {
        console.error("Error en deleteEvent:", err);
    }
}

function editEvent(id) {
    try {
        const event = events.find(event => event.id === id);
        if (event) {
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

                    localStorage.setItem("events", JSON.stringify(events));
                    renderEvents();
                    eventForm.reset();
                    submitButton.textContent = "Add Event";
                } catch (err) {
                    console.error("Error actualizando evento:", err);
                }
            };

            deleteEvent(id);
        }
    } catch (err) {
        console.error("Error en editEvent:", err);
    }
}

//La API solo calcula el clima si está en un rango de 7 días!!!
function getWeatherForEvent(event, callback) {
    try {
        const lat = 40.4168;
        const lon = -3.7038;

        const eventDate = new Date(`${event.eventDate}T${event.eventTime}`);
        const formattedDate = eventDate.toISOString().split('T')[0];

        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Madrid`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                try {
                    if (data.daily && data.daily.time) {
                        const index = data.daily.time.indexOf(formattedDate);
                        if (index !== -1) {
                            const maxTemp = data.daily.temperature_2m_max[index];
                            const minTemp = data.daily.temperature_2m_min[index];
                            const precipitation = data.daily.precipitation_sum[index];

                            const weatherText = `Max: ${maxTemp}°C | Min: ${minTemp}°C | Precip: ${precipitation}mm`;
                            callback(weatherText);
                        } else {
                            callback("Clima no disponible para esta fecha.");
                        }
                    } else {
                        callback("Error obteniendo clima.");
                    }
                } catch (err) {
                    console.error("Error procesando datos de clima:", err);
                    callback("Error procesando el clima.");
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                callback("Error en la API del clima.");
            });
    } catch (err) {
        console.error("Error general en getWeatherForEvent:", err);
        callback("Error inesperado en clima.");
    }
}

function getNews() {
    try {
        const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=6&apiKey=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                try {
                    if (data.status === "ok") {
                        renderNews(data.articles);
                    } else {
                        alert("Error al obtener noticias");
                    }
                } catch (err) {
                    console.error("Error procesando noticias:", err);
                }
            })
            .catch(error => {
                console.error("Error en la solicitud:", error);
            });
    } catch (err) {
        console.error("Error general en getNews:", err);
    }
}

function renderNews(articles) {
    try {
        const newsContainer = document.getElementById("news-container");
        newsContainer.innerHTML = "";

        articles.forEach(article => {
            try {
                const newsItem = document.createElement("div");
                newsItem.classList.add("news-item");

                newsItem.innerHTML = `
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    <p>${article.description}</p>
                    <p><strong>Source:</strong> ${article.source.name}</p>
                    <p><strong>Published at:</strong> ${new Date(article.publishedAt).toLocaleString()}</p>
                `;

                newsContainer.appendChild(newsItem);
            } catch (err) {
                console.error("Error renderizando una noticia:", err);
            }
        });
    } catch (err) {
        console.error("Error en renderNews:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("TaskPlanner initialized");
        loadTasks();
        loadEvents();
        getNews();
        document.getElementById("task-form").addEventListener("submit", addTask);
        document.getElementById("event-form").addEventListener("submit", addEvent);
    } catch (err) {
        console.error("Error en DOMContentLoaded:", err);
    }
});
