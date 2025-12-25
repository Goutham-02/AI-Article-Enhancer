import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://beyondchats.com";
const BLOGS_BASE_URL = `${BASE_URL}/blogs`;
const LAST_PAGE = 15;
const FIRST_PAGE = 13;
const OUTPUT_FILE = "blogs_full.json";



function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return undefined;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

function extractBlogs(html) {
  const $ = cheerio.load(html);
  const blogs = [];
  const seen = new Set();

  $("main h2, main h3").each((_, el) => {
    const $heading = $(el);
    const $titleLink = $heading.find("a[href*='/blogs/']");

    if ($titleLink.length === 0) return;

    let href = $titleLink.attr("href");
    if (!href) return;

    if (!href.startsWith("http")) href = BASE_URL + href;

    if (
      !href.startsWith(`${BLOGS_BASE_URL}/`) ||
      href.includes("/tag/") ||
      href.includes("/author/") ||
      href.includes("/category/")
    ) {
      return;
    }

    if (seen.has(href)) return;
    seen.add(href);

    const title = $titleLink.text().trim() || undefined;

    let $container = $heading.closest("article");
    if ($container.length === 0) $container = $heading.parent();

    const containerText = $container.text() || "";

    const dateMatch = containerText.match(
      /([A-Z][A-Z]+\s+\d{1,2},\s+\d{4})/
    );
    const dateText = dateMatch ? dateMatch[0] : undefined;
    const dateObj = dateText ? parseDate(dateText) : undefined;

    const authorMatch = containerText.match(
      /([A-Z][A-Z\s]+?)(?:\s*\/|\s*•)/
    );
    const author = authorMatch ? authorMatch[1].trim() : undefined;

    const tags = [];
    $container
      .find("a[href*='/blogs/tag/'], a[href*='/blogs/category/']")
      .each((_, tagEl) => {
        let tag = $(tagEl).text().replace(/[#\s]+/g, " ").trim();
        if (tag && !tags.includes(tag)) tags.push(tag);
      });

    const $firstPara = $container.find("p").first();
    const excerpt =
      $firstPara.length > 0
        ? $firstPara.text().trim().substring(0, 200)
        : undefined;

    blogs.push({
      title,
      url: href || undefined,
      author: author || undefined,
      dateText: dateText || undefined,
      dateISO: dateObj ? dateObj.toISOString() : undefined,
      dateUnix: dateObj ? dateObj.getTime() : undefined,
      excerpt,
      tags: tags.length ? tags : undefined,
      publishedDate:
        dateText &&
        new Date(dateText).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
    });
  });

  return blogs;
}

async function scrapeBlogs() {

  const allBlogs = [];

  for (let page = FIRST_PAGE; page <= LAST_PAGE; page++) {
    const pageUrl = `${BLOGS_BASE_URL}/page/${page}/`;
    try {
      const html = await fetchHtml(pageUrl);
      const pageBlogs = extractBlogs(html);

      allBlogs.push(...pageBlogs);

    } catch (e) {
      console.error(`Error on page ${page}: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  const outputPath = path.join(__dirname, OUTPUT_FILE);

  const outputData = {
    scrapedAt: new Date().toISOString(),
    total: allBlogs.length,
    blogs: allBlogs
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), "utf8");

  console.log(`saved ${OUTPUT_FILE}`);
}

scrapeBlogs();
