let editingTaskId = null;

export async function handleTaskSubmit(event) {
  event.preventDefault();

  try {
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const dueDate = document.getElementById("task-date").value;
    const status = document.getElementById("task-status").value;
    const token = localStorage.getItem("token");

    if (!title || !dueDate) {
      alert("Título y fecha son requeridos");
      return;
    }

    const taskData = { title, description, date: new Date(dueDate), status };
    let response;

    if (editingTaskId) {
      response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      });
      editingTaskId = null;
    } else {
      response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      });
    }

    if (response.ok) {
      loadTasks();
      document.getElementById("task-form").reset();
    } else {
      alert("Error: No tienes permiso para realizar esta acción.");
    }
  } catch (err) {
    console.error("Error en handleTaskSubmit:", err);
  }
}

export async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    console.error("Error en loadTasks:", err);
  }
}

async function renderTasks(tasks = []) {
  const pendingColumn = document.getElementById("pending-column");
  const inProgressColumn = document.getElementById("inprogress-column");
  const completedColumn = document.getElementById("completed-column");

  const pendingList = document.getElementById("pending-tasks");
  const inProgressList = document.getElementById("inprogress-tasks");
  const completedList = document.getElementById("completed-tasks");

  // Limpiar las listas
  pendingList.innerHTML = "";
  inProgressList.innerHTML = "";
  completedList.innerHTML = "";

  const userRole = localStorage.getItem("role");

  // Añadir las tareas correspondientes a cada lista
  tasks.forEach(task => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");

    taskItem.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Due:</strong> ${new Date(task.date).toLocaleDateString()}</p>
      ${userRole === "admin" ? `
        <button onclick="editTask('${task._id}')">Edit</button>
        <button onclick="deleteTask('${task._id}')">Delete</button>` : ""}
    `;

    // Asignar las tareas a sus respectivas listas
    if (task.status === "pending") {
      pendingList.appendChild(taskItem);
    } else if (task.status === "inprogress") {
      inProgressList.appendChild(taskItem);
    } else if (task.status === "completed") {
      completedList.appendChild(taskItem);
    }
  });

  // Obtener el valor del filtro seleccionado
  const filterValue = document.getElementById("task-filter").value;

  // Mostrar u ocultar columnas según el filtro
  if (filterValue === "all") {
    pendingColumn.classList.remove("hidden");
    inProgressColumn.classList.remove("hidden");
    completedColumn.classList.remove("hidden");
  } else {
    pendingColumn.classList.toggle("hidden", filterValue !== "pending");
    inProgressColumn.classList.toggle("hidden", filterValue !== "inprogress");
    completedColumn.classList.toggle("hidden", filterValue !== "completed");
  }

  // Ocultar columnas vacías
  if (pendingList.children.length === 0) pendingColumn.classList.add("hidden");
  if (inProgressList.children.length === 0) inProgressColumn.classList.add("hidden");
  if (completedList.children.length === 0) completedColumn.classList.add("hidden");

  // Centrar columna si solo hay una visible
  const columnsWrapper = document.getElementById("columns-wrapper");
  const visibleColumns = [pendingColumn, inProgressColumn, completedColumn].filter(
    col => !col.classList.contains("hidden")
  );

  if (visibleColumns.length === 1) {
    columnsWrapper.classList.add("centered-column");
  } else {
    columnsWrapper.classList.remove("centered-column");
  }
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

export async function updateStatus(id, newStatus) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      loadTasks();
    } else {
      alert("No autorizado para cambiar el estado.");
    }
  } catch (err) {
    console.error("Error en updateStatus:", err);
  }
}

export async function deleteTask(id) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      loadTasks();
    } else {
      alert("No autorizado para eliminar.");
    }
  } catch (err) {
    console.error("Error en deleteTask:", err);
  }
}

export async function editTask(id) {
  try {
    const response = await fetch(`/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error("Tarea no encontrada");
    }
    const taskData = await response.json();
    document.getElementById("task-title").value = taskData.title;
    document.getElementById("task-desc").value = taskData.description;
    document.getElementById("task-date").value = new Date(taskData.date).toISOString().split('T')[0];
    document.getElementById("task-status").value = taskData.status;
    editingTaskId = id;
  } catch (err) {
    console.error("Error en editTask:", err);
  }
}
