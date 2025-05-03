import { loadTasks, handleTaskSubmit, filterTasks, deleteTask, editTask, updateStatus } from "./controllers/taskController.js";
import { loadEvents, handleEventSubmit, editEvent, deleteEvent } from "./controllers/eventController.js";
import { getNews } from "./services/newsService.js";
import { handleError } from "./middlewares/errorHandler.js";

document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("TaskPlanner initialized");

        // Cargar datos iniciales
        loadTasks(); // Carga inicial de las tareas
        loadEvents(); // Carga eventos
        getNews(); // Cargar noticias
        loadPhotos(); // Cargar fotos

        // Asignar eventos
        document.getElementById("task-form").addEventListener("submit", handleTaskSubmit);
        document.getElementById("event-form").addEventListener("submit", handleEventSubmit);

        // Manejar subida de fotos
        const photoForm = document.getElementById("photo-form");
        if (photoForm) {
            photoForm.addEventListener("submit", handlePhotoSubmit);
        } else {
            console.error("Formulario de fotos no encontrado");
        }

        // Agregar event listeners para los botones de eliminar foto
        const photosContainer = document.getElementById("photo-gallery");
        if (photosContainer) {
            photosContainer.addEventListener("click", function(event) {
                if (event.target && event.target.classList.contains("delete-photo")) {
                    const filename = event.target.closest(".photo-item").querySelector("img").getAttribute("src").split("/").pop();
                    deletePhoto(filename);
                }
            });
        } else {
            console.error("No se encontró el contenedor de fotos.");
        }

    } catch (err) {
        handleError(err, "DOMContentLoaded");
    }
});

// Exponer funciones al ámbito global para el uso en HTML (onclick, onchange)
window.editTask = editTask;
window.deleteTask = deleteTask;
window.filterTasks = filterTasks;  // Solo se expone para ser usado en eventos específicos
window.updateStatus = updateStatus;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

// Función para cargar fotos desde el backend
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
                    photoItem.innerHTML = `
                        <img src="/uploads/${filename}" alt="Foto" class="photo-thumbnail" />
                        <button class="delete-photo">Eliminar</button>
                    `;
                    photosContainer.appendChild(photoItem);
                });
            } else {
                console.error("No se encontró el contenedor de fotos.");
            }
        })
        .catch(err => handleError(err, "loadPhotos"));
}

// Función para manejar el formulario de subida de fotos
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

// Función para eliminar una foto
function deletePhoto(filename) {
    fetch(`/api/photos/${filename}`, {
        method: "DELETE"
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
