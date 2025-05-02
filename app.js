import { loadTasks, handleTaskSubmit } from "./controllers/taskController.js";
import { loadEvents, handleEventSubmit } from "./controllers/eventController.js";
import { getNews } from "./services/newsService.js";
import { handleError } from "./middlewares/errorHandler.js";

document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("TaskPlanner initialized");

        // Cargar datos iniciales
        loadTasks();
        loadEvents();
        getNews();
        loadPhotos(); // Cargar las fotos existentes al iniciar

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
    } catch (err) {
        handleError(err, "DOMContentLoaded");
    }
});

// Función para cargar fotos desde el backend
function loadPhotos() {
    fetch("/api/photos")
        .then(response => response.json())
        .then(data => {
            const photosContainer = document.getElementById("photo-gallery");  // Cambiado de 'photos-container' a 'photo-gallery'
            if (photosContainer) {
                photosContainer.innerHTML = ""; // Limpiar contenedor

                data.forEach(filename => {
                    const photoItem = document.createElement("div");
                    photoItem.classList.add("photo-item");
                    photoItem.innerHTML = `
                        <img src="/uploads/${filename}" alt="Foto" class="photo-thumbnail" />
                        <button class="delete-photo">Eliminar</button>
                    `;
                    
                    // Asociar el event listener al botón de eliminar
                    const deleteButton = photoItem.querySelector(".delete-photo");
                    deleteButton.addEventListener("click", function() {
                        deletePhoto(filename); // Llamar a la función deletePhoto con el nombre del archivo
                    });

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
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario

    const photoInput = document.getElementById("photo-upload");  // Cambiado de 'photo-input' a 'photo-upload'

    // Verificar si el input de foto existe y si se ha seleccionado un archivo
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
                loadPhotos();  // Recargar fotos
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
            loadPhotos(); // Recargar fotos
        } else {
            alert("Error al eliminar la foto.");
        }
    })
    .catch(err => handleError(err, "deletePhoto"));
}
