import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const API_URL = (process.env.LARAVEL_API || "").trim();
const SERP_API_KEY = (process.env.SERP_API_KEY || "").trim();
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();

// console.log(API_URL);
// console.log(SERP_API_KEY);
// console.log(GEMINI_API_KEY);

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
});

// async function something() {
//     try {
//         const res = await model.generateContent("generate a 2 line review of hp pavilion 15 laptop");
//         console.log("res ", res.response.text());
//     } catch (error) {
//         console.error("error:", error);
//     }
// }

// something();

async function getArticle() {
    try {
        console.log("api : ", API_URL);
        const response = await axios.get(API_URL);
        const originalArticles = response.data.filter(a => !a.is_generated);

        if (originalArticles.length === 0) {
            console.log("no articles found");
            return null;
        }

        console.log(`articles found: "${originalArticles[0].title}"`);
        return originalArticles[0];
    } catch (error) {
        console.error("error: ", error.message);
        return null;
    }
}

async function searchGoogle(query) {
    // console.log("query, ", query);
    try {
        console.log(`google search "${query}"`);
        const response = await axios.get("https://serpapi.com/search", {
            params: { engine: "google", q: query, api_key: SERP_API_KEY, num: 8 }
        });

        const links = (response.data.organic_results || [])
            .map(r => r.link)
            .filter(l => l &&
                !l.includes("youtube.com") &&
                !l.includes("beyondchats.com")
            )
            .slice(0, 2);
        console.log("no of links: ", links.length)
        console.log("google links: ", links);
        return links;
    } catch (error) {
        console.error("error: ", error.message);
        return [];
    }
}

async function scrapeContent(url) {
    try {
        console.log(`checking: ${url}`);
        const { data } = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        $('script, style, nav, footer, header, noscript').remove();
        const text = ($('article').text() || $('main').text() || $('body').text())
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 6000);

        console.log("scraped text: ", text);
        return text;
    } catch (error) {
        console.error(`Scrape failed for ${url}:`, error.message);
        return "";
    }
}

async function rewriteArticle(originalArticle, referenceContents) {
    try {
        console.log("ai gemini running ");
        const prompt = `
            ### ROLE
            You are a Senior Technical Journalist and SEO Specialist for a high-end business publication. Your goal is to produce authoritative, data-driven, and professional content.

            ### INPUT DATA
            - **Original Title:** ${originalArticle.title}
            - **Original Content:** ${originalArticle.content.slice(0, 6000)}
            - **Supplementary References:** ${referenceContents.join("\n\n")}

            ### OUTPUT SPECIFICATION
            Return a strictly valid JSON object: { "title": "string", "body": "string" }

            1.  **"title"**: 
                - Professional, concise, and SEO-focused. 
                - Avoid "clickbait" sensationalism.

            2.  **"body"**:
                - **Voice**: Maintain a formal, analytical, and sophisticated tone. 
                - **Structure**: Use a clear hierarchy with H2 and H3 headers. 
                - **Formatting**: Use Markdown. Emphasize key concepts with bolding. Use bullet points for readability.
                - **Synthesis**: Integrate the reference data seamlessly. If there are conflicting facts, use phrases like "While some sources suggest X, recent data indicates Y."

            ### STRICT STYLE RULES (STRICT ADHERENCE REQUIRED)
            - **NO EMOJIS**: Do not use any emojis or emoticons under any circumstances.
            - **NO FLUFF**: Avoid introductory filler like "In this article, we will explore..."
            - **NO EXCESSIVE EXCLAMATION**: Use professional punctuation; avoid exclamation marks.
            - **LANGUAGE**: Use sophisticated vocabulary (e.g., use "utilize" instead of "use," "comprehensive" instead of "big").

            ### FINAL JSON FORMATTING
            - Output ONLY the JSON object.
            - Ensure all internal double quotes are escaped (e.g., \\") to prevent JSON parsing errors.
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();

        console.log("gemini done");
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Rewrite Error:", error.message);
        return null;
    }
}

async function saveToDatabase(originalArticle, rewrittenData, referenceLinks) {
    try {

        let finalBody = rewrittenData.body;

        if (referenceLinks && referenceLinks.length > 0) {
            finalBody += "\n\n---\n### References: \n";
            referenceLinks.forEach((link, index) => {
                finalBody += `${index + 1}. [Link](${link})\n`;
            });
        }

        const payload = {
            title: rewrittenData.title,
            content: finalBody,
            references: referenceLinks,
            source_url: originalArticle.source_url || "N/A",
            is_generated: true
        };

        const response = await axios.post(API_URL, payload);
        console.log("saved to db");
        console.log(response.data.id);
    } catch (error) {
        console.error("error:", error);
    }
}

async function main() {

    if (!API_URL || !SERP_API_KEY || !GEMINI_API_KEY) {
        console.error("Missing API keys in .env");
        return;
    }

    const article = await getArticle();
    if (!article) return;

    const links = await searchGoogle(article.title);
    if (links.length === 0) {
        console.log("no google search found");
        return;
    }

    const scraped = [];
    for (const link of links) {
        const text = await scrapeContent(link);
        if (text) scraped.push(text);
    }

    if (scraped.length === 0) {
        console.log("no scraped text");
        return;
    }

    const rewrittenData = await rewriteArticle(article, scraped);
    if (rewrittenData) {
        await saveToDatabase(article, rewrittenData, links);
    }
}

main();