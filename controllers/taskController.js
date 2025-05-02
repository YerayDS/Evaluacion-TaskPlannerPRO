import { tasks, saveTasks } from "../models/taskModel.js";
import { handleError } from "../middlewares/errorHandler.js";

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

export function loadTasks() {
    try {
        renderTasks();
    } catch (err) {
        handleError(err, "loadTasks");
    }
}

function renderTasks(filter = "all") {
    try {
        const pendingList = document.getElementById("pending-tasks");
        const inProgressList = document.getElementById("inprogress-tasks");
        const completedList = document.getElementById("completed-tasks");

        pendingList.innerHTML = "";
        inProgressList.innerHTML = "";
        completedList.innerHTML = "";

        const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

        filtered.forEach(task => {
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-item");
            taskItem.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p><strong>Due:</strong> ${task.dueDate}</p>
            `;
            if (task.status === "pending") pendingList.appendChild(taskItem);
            else if (task.status === "inprogress") inProgressList.appendChild(taskItem);
            else if (task.status === "completed") completedList.appendChild(taskItem);
        });
    } catch (err) {
        handleError(err, "renderTasks");
    }
}