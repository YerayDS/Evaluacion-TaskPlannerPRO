export let events = JSON.parse(localStorage.getItem("events")) || [];

export function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
}