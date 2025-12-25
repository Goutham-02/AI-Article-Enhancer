import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "http://127.0.0.1:8000/api/articles";
const FILE_PATH = path.join(__dirname, "oldest_blogs.json");

async function importArticles() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            throw new Error(`File not found at ${FILE_PATH}`);
        }
        const raw = fs.readFileSync(FILE_PATH, "utf-8");
        const data = JSON.parse(raw);

        const articles = Array.isArray(data) ? data : (data.blogs || []);

        if (articles.length === 0) {
            console.log("No articles to import.");
            return;
        }

        for (const a of articles) {

            await axios.post(API_URL, {
                title: a.title,
                content: a.content || "", 
                source_url: a.url || null,
                is_generated: false
            });
        }

    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("API Response:", err.response.data);
        }
    }
}

importArticles();
