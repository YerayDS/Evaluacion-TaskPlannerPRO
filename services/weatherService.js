export async function getWeatherForEvent(event) {
    const lat = 40.4168;
    const lon = -3.7038;
    const formattedDate = new Date(`${event.eventDate}T${event.eventTime}`).toISOString().split('T')[0];

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Madrid`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.daily && data.daily.time) {
            const index = data.daily.time.indexOf(formattedDate);
            if (index !== -1) {
                return `Max: ${data.daily.temperature_2m_max[index]}°C | Min: ${data.daily.temperature_2m_min[index]}°C | Precip: ${data.daily.precipitation_sum[index]}mm`;
            } else {
                return "Clima no disponible para esta fecha.";
            }
        } else {
            return "Error obteniendo clima.";
        }
    } catch (err) {
        throw new Error("Error en la API del clima.");
    }
}