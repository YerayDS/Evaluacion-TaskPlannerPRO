let editingTaskId = null; // Variable global para saber si estamos editando

// Función para manejar el envío del formulario de tareas
export async function handleTaskSubmit(event) {
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

    const taskData = { title, description, date: new Date(dueDate), status };

    let response;

    if (editingTaskId) {
      // Editar tarea existente
      response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      editingTaskId = null; // Resetear modo edición
    } else {
      // Crear nueva tarea
      response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
    }

    if (response.ok) {
      loadTasks();
      document.getElementById("task-form").reset();
    } else {
      console.error("Error al guardar la tarea");
    }
  } catch (err) {
    console.error("Error en handleTaskSubmit:", err);
  }
}

// Función para cargar todas las tareas
export async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    console.error("Error en loadTasks:", err);
  }
}

// Función para renderizar las tareas
async function renderTasks(tasks = []) {
  const pendingList = document.getElementById("pending-tasks");
  const inProgressList = document.getElementById("inprogress-tasks");
  const completedList = document.getElementById("completed-tasks");

  pendingList.innerHTML = "";
  inProgressList.innerHTML = "";
  completedList.innerHTML = "";

  tasks.forEach(task => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");
    taskItem.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Due:</strong> ${new Date(task.date).toLocaleDateString()}</p>
      <select onchange="updateStatus('${task._id}', this.value)">
        <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
        <option value="inprogress" ${task.status === "inprogress" ? "selected" : ""}>In Progress</option>
        <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
      </select>
      <button onclick="editTask('${task._id}')">Edit</button>
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;

    if (task.status === "pending") pendingList.appendChild(taskItem);
    else if (task.status === "inprogress") inProgressList.appendChild(taskItem);
    else if (task.status === "completed") completedList.appendChild(taskItem);
  });
}

export async function filterTasks() {
    try {
      const filterValue = document.getElementById("task-filter").value;
      const url = filterValue === "all" ? "/api/tasks" : `/api/tasks?status=${filterValue}`;
  
      const response = await fetch(url);
      const tasks = await response.json();
      renderTasks(tasks);
    } catch (err) {
      console.error("Error en filterTasks:", err);
    }
  }

// Función para actualizar el estado de una tarea
export async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      loadTasks();
    } else {
      console.error("Error al actualizar la tarea");
    }
  } catch (err) {
    console.error("Error en updateStatus:", err);
  }
}

// Función para eliminar una tarea
export async function deleteTask(id) {
  try {
    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

    if (response.ok) {
      loadTasks();
    } else {
      console.error("Error al eliminar la tarea");
    }
  } catch (err) {
    console.error("Error en deleteTask:", err);
  }
}

// Función para editar una tarea
export async function editTask(id) {
  try {
    const response = await fetch(`/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error("Tarea no encontrada");
    }
    const taskData = await response.json();

    // Rellenar el formulario con los datos
    document.getElementById("task-title").value = taskData.title;
    document.getElementById("task-desc").value = taskData.description;
    document.getElementById("task-date").value = new Date(taskData.date).toISOString().split('T')[0];
    document.getElementById("task-status").value = taskData.status;

    editingTaskId = id; // Activar modo edición
  } catch (err) {
    console.error("Error en editTask:", err);
  }
}
