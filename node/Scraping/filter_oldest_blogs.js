
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = "data.json";
const OUTPUT_FILE = "oldest_blogs.json";

function filterOldestBlogs() {
    const inputPath = path.join(__dirname, INPUT_FILE);

    if (!fs.existsSync(inputPath)) {
        console.error(`Error: ${INPUT_FILE} not found in ${__dirname}`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(inputPath, "utf8");
        const data = JSON.parse(rawData);

        if (!data.blogs || !Array.isArray(data.blogs)) {
            console.error("Error: Invalid JSON format. 'blogs' array missing.");
            process.exit(1);
        }

        const sortedBlogs = data.blogs.sort((a, b) => {
            const dateA = new Date(a.publishedTime);
            const dateB = new Date(b.publishedTime);
            return dateA - dateB;
        });

        const oldestFive = sortedBlogs.slice(0, 5);

        const output = {
            filteredAt: new Date().toISOString(),
            count: oldestFive.length,
            blogs: oldestFive
        };

        const outputPath = path.join(__dirname, OUTPUT_FILE);
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

        console.log(`saved ${outputPath}`);

    } catch (error) {
        console.error("Error processing file:", error);
        process.exit(1);
    }
}

filterOldestBlogs();
