import { handleError } from "../middlewares/errorHandler.js";

const apiKey = "5f4ec6a1f0b745eca5157c7977a45f1a";

export async function getNews() {
    try {
        const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=6&apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "ok") {
            renderNews(data.articles);
        } else {
            alert("Error al obtener noticias");
        }
    } catch (err) {
        handleError(err, "getNews");
    }
}

function renderNews(articles) {
    try {
        const newsContainer = document.getElementById("news-container");
        newsContainer.innerHTML = "";

        articles.forEach(article => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");
            newsItem.innerHTML = `
                <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                <p>${article.description}</p>
                <p><strong>Source:</strong> ${article.source.name}</p>
                <p><strong>Published at:</strong> ${new Date(article.publishedAt).toLocaleString()}</p>
            `;
            newsContainer.appendChild(newsItem);
        });
    } catch (err) {
        handleError(err, "renderNews");
    }
}