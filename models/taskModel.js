export let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

export function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}