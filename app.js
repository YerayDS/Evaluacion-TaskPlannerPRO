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
        console.log(payload);  // Verifica que el payload tenga la propiedad `role` correctamente asignada.
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

        const navButtons = document.querySelectorAll(".section-nav button");

        navButtons.forEach(button => {
            button.addEventListener("click", () => {
                const sectionId = button.dataset.section;
                showSection(sectionId);

                navButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
            });
        });

        function showSection(sectionId) {
            const sections = document.querySelectorAll("main > section");
            sections.forEach(section => section.classList.add("hidden"));
            const target = document.getElementById(sectionId);
            if (target) target.classList.remove("hidden");
        }

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

                    // Asegúrate de que el rol se lee correctamente
                    console.log('Rol en localStorage:', localStorage.getItem('role'));

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
