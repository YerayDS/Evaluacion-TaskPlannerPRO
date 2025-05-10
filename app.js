import { loadTasks, handleTaskSubmit, filterTasks, deleteTask, editTask, updateStatus } from "./controllers/taskController.js";
import { loadEvents, handleEventSubmit, editEvent, deleteEvent } from "./controllers/eventController.js";
import { getNews } from "./services/newsService.js";
import { handleError } from "./middlewares/errorHandler.js";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(payload);
        if (payload.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.remove('hidden');
            });
        } else {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('hidden');
            });
        }
    } catch (err) {
        console.error("Token inválido:", err);
        alert("Token inválido o expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "/";
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "auth.html";
        });
    }

    try {
        loadTasks(); 
        loadEvents();
        getNews(); 
        loadPhotos(); 

        const taskForm = document.getElementById("task-form");
        if (taskForm) {
            taskForm.addEventListener("submit", handleTaskSubmit);
        }

        const eventForm = document.getElementById("event-form");
        if (eventForm) {
            eventForm.addEventListener("submit", handleEventSubmit);
        }

        const photoForm = document.getElementById("photo-form");
        if (photoForm) {
            photoForm.addEventListener("submit", handlePhotoSubmit);
        }

        const photosContainer = document.getElementById("photo-gallery");
        if (photosContainer) {
            photosContainer.addEventListener("click", function(event) {
                if (event.target && event.target.classList.contains("delete-photo")) {
                    const filename = event.target.closest(".photo-item").querySelector("img").getAttribute("src").split("/").pop();
                    deletePhoto(filename);
                }
            });
        }
    } catch (err) {
        handleError(err, "DOMContentLoaded");
    }
});

window.editTask = editTask;
window.deleteTask = deleteTask;
window.filterTasks = filterTasks;  
window.updateStatus = updateStatus;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

function loadPhotos() {
    fetch("/api/photos")
        .then(response => response.json())
        .then(data => {
            const photosContainer = document.getElementById("photo-gallery");
            if (photosContainer) {
                photosContainer.innerHTML = ""; 
                data.forEach(filename => {
                    const photoItem = document.createElement("div");
                    photoItem.classList.add("photo-item");

                    const deleteButton = localStorage.getItem("role") === "admin" ? `
                        <button class="delete-photo">Delete</button>
                    ` : '';

                    photoItem.innerHTML = `
                        <img src="/uploads/${filename}" alt="Foto" class="photo-thumbnail" />
                        ${deleteButton}
                    `;
                    photosContainer.appendChild(photoItem);
                });
            }
        })
        .catch(err => handleError(err, "loadPhotos"));
}

function handlePhotoSubmit(event) {
    event.preventDefault();
    const photoInput = document.getElementById("photo-upload");
    if (photoInput && photoInput.files.length > 0) {
        const formData = new FormData();
        formData.append("photo", photoInput.files[0]);
        fetch("/api/photos", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.file) {
                loadPhotos();
            } else {
                alert("Error al subir la foto.");
            }
        })
        .catch(err => handleError(err, "handlePhotoSubmit"));
    } else {
        alert("Selecciona una foto para subir.");
    }
}

function deletePhoto(filename) {
    const token = localStorage.getItem("token");  
    fetch(`/api/photos/${filename}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Foto eliminada.") {
            loadPhotos();
        } else {
            alert("Error al eliminar la foto.");
        }
    })
    .catch(err => handleError(err, "deletePhoto"));
}

// === CHAT CON WEBSOCKETS ===
let socket;
let chatBox = document.getElementById("chat-box");
let chatBtn = document.querySelector(".chat-btn");
let sendButton = document.getElementById("send-btn");
let chatInput = document.getElementById("chat-input");
let closeButton = document.getElementById("close-chat-btn");
let messagesDiv = document.getElementById("chat-messages");

function connectWebSocket() {
    socket = new WebSocket(`ws://${window.location.host}`);

    socket.addEventListener("open", () => {
        console.log("WebSocket conectado");
    });

    socket.addEventListener("message", (event) => {
        const message = document.createElement("div");
        message.textContent = event.data;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar al fondo
    });

    socket.addEventListener("close", () => {
        console.log("WebSocket desconectado");
        setTimeout(connectWebSocket, 5000);  // Reintentar la conexión en 5 segundos
    });

    socket.addEventListener("error", (err) => {
        console.error("Error en WebSocket:", err);
    });
}

chatBtn.addEventListener("click", () => {
    chatBox.style.display = "flex";
    chatInput.focus();  // Foco automático en el campo de entrada
});

closeButton.addEventListener("click", () => {
    chatBox.style.display = "none";
});

sendButton.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (message !== "") {
        socket.send(message);  // Enviar mensaje al servidor
        chatInput.value = "";  // Limpiar el campo de entrada
    }
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();  // Simula un clic en el botón de enviar
    }
});

window.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();  // Establece la conexión WebSocket
});
