export function handleError(error, context = "") {
    console.error(`Error${context ? " en " + context : ""}:`, error);
    alert(`Ocurrió un error${context ? " en " + context : ""}. Por favor, revisa la consola.`);
}