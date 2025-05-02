import { tasks, saveTasks } from "../models/taskModel.js";
import { handleError } from "../middlewares/errorHandler.js";

// Función para añadir una nueva tarea
export function handleTaskSubmit(event) {
    event.preventDefault();

    try {
        const title = document.getElementById("task-title").value.trim();
        const description = document.getElementById("task-desc").value.trim();
        const dueDate = document.getElementById("task-date").value;
        const status = document.getElementById("task-status").value;

        if (!title || !dueDate) {
            alert("Título y fecha son requeridos");
            return;
        }

        const newTask = {
            id: Date.now(),
            title,
            description,
            dueDate,
            status,
            taskDate: new Date(dueDate)
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        document.getElementById("task-form").reset();
    } catch (err) {
        handleError(err, "handleTaskSubmit");
    }
}

// Función para cargar las tareas
export function loadTasks() {
    try {
        renderTasks();
    } catch (err) {
        handleError(err, "loadTasks");
    }
}

// Función para renderizar las tareas basadas en el filtro
function renderTasks(filter = "all") {
    try {
        const pendingList = document.getElementById("pending-tasks");
        const inProgressList = document.getElementById("inprogress-tasks");
        const completedList = document.getElementById("completed-tasks");

        // Limpiar las listas
        pendingList.innerHTML = "";
        inProgressList.innerHTML = "";
        completedList.innerHTML = "";

        // Filtrar tareas según el filtro
        const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

        // Renderizar tareas
        filtered.forEach(task => {
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
            if (task.status === "pending") pendingList.appendChild(taskItem);
            else if (task.status === "inprogress") inProgressList.appendChild(taskItem);
            else if (task.status === "completed") completedList.appendChild(taskItem);
        });
    } catch (err) {
        handleError(err, "renderTasks");
    }
}

// Función para filtrar las tareas
export function filterTasks() {
    try {
        const filterValue = document.getElementById("task-filter").value;
        renderTasks(filterValue);
    } catch (err) {
        console.error("Error en filterTasks:", err);
    }
}

// Función para actualizar el estado de una tarea
export function updateStatus(id, newStatus) {
    try {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
            renderTasks(document.getElementById("task-filter").value);
        }
    } catch (err) {
        console.error("Error en updateStatus:", err);
    }
}

// Función para eliminar una tarea
export function deleteTask(id) {
    try {
        tasks.splice(0, tasks.length, ...tasks.filter(task => task.id !== id)); // ✅
        saveTasks();
        renderTasks(document.getElementById("task-filter").value);
    } catch (err) {
        console.error("Error en deleteTask:", err);
    }
}

// Función para editar una tarea
export function editTask(id) {
    try {
        const task = tasks.find(task => task.id === id);
        if (task) {
            document.getElementById("task-title").value = task.title;
            document.getElementById("task-desc").value = task.description;
            document.getElementById("task-date").value = task.dueDate;
            document.getElementById("task-status").value = task.status;
            deleteTask(id);  // Elimina la tarea después de cargar sus datos
        }
    } catch (err) {
        console.error("Error en editTask:", err);
    }
}

