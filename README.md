# 🚀 AI-Enhanced Article Rewriter

> An intelligent content automation pipeline that scrapes, analyses, and rewrites blog articles using advanced AI, served via a modern Laravel API and a premium React frontend.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table of Contents
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#1-prerequisites)
  - [Backend Setup (Laravel)](#2-backend-setup-laravel)
  - [AI Engine Setup (Node.js)](#3-ai-engine-setup-nodejs)
  - [Frontend Setup (React)](#4-frontend-setup-react)
- [Usage Workflow](#-usage-workflow)
- [Live Demo](#-live-demo)

---

## 🏗 Architecture

The system follows a microservices-inspired architecture where the Node.js AI Engine operates independently to process content and updates the Laravel System of Record.

```mermaid
graph TD
    subgraph "AI Engine (Node.js)"
        S[Scraper Service] -->|Text Extraction| P[Content Processor]
        P -->|Search Query| G[SerpAPI (Google)]
        P -->|Context & Prompt| L[Gemini LLM]
        G -->|Reference Articles| P
        L -->|Rewritten Content| A[API Client]
    end

    subgraph "Backend Core (Laravel)"
        A -->|POST /api/articles| C[ArticleController]
        C -->|Store/Update| DB[(MySQL Database)]
        C -->|Serve JSON| F[Frontend API]
    end

    subgraph "Client Layer (React)"
        F -->|Fetch Data| UI[Material UI Interface]
        UI -->|Display| User[End User]
    end
```

---

## ✨ Features

- **Automated Scraping**: robust extraction of clean text from target blogs.
- **Smart Enrichment**: Searches Google for relevant, high-ranking reference articles to ensure content authority.
- **AI Rewriting**: Uses **Google Gemini 1.5 Flash** to synthesize original content with new insights.
- **Reference Tracking**: Automatically links and cites sources used during the rewrite.
- **Comparison View**: Frontend allows side-by-side toggling between the **Original** and **AI Enhanced** versions.
- **Premium UI**: Built with **Material UI**, featuring glassmorphism, responsive grids, and clean typography.

---

## 🛠 Tech Stack

- **Backend**: Laravel 11, MySQL
- **AI/Scripting**: Node.js, Cheerio, Axios, Google Generative AI SDK, SerpAPI
- **Frontend**: React 19, Material UI (MUI), Framer Motion
- **Architecture**: RESTful API

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
- PHP 8.2+ & Composer
- Node.js 18+ & NPM
- MySQL Database

### 2. Backend Setup (Laravel)
```bash
cd laravel
composer install
cp .env.example .env
# Configure DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env
php artisan key:generate
php artisan migrate
php artisan serve
```
*API will run at `http://127.0.0.1:8000`*

### 3. AI Engine Setup (Node.js)
```bash
cd node
npm install
# Ensure .env contains:
# LARAVEL_API=http://127.0.0.1:8000/api/articles
# SERP_API_KEY=your_key
# GEMINI_API_KEY=your_key
```

### 4. Frontend Setup (React)
```bash
cd frontend
npm install
npm start
```
*Frontend will run at `http://localhost:3000`*

---

## 🔄 Usage Workflow

1.  **Import Data**: Run the importer to populate the database with initial articles.
    ```bash
    node Scraping/import_data.js
    ```
2.  **Run AI Enhancement**: Trigger the main pipeline. It will fetch an original article, research it, rewrite it, and save the result.
    ```bash
    node main.js
    ```
3.  **View Results**: Open `http://localhost:3000`. Click on any card marked **"AI Enhanced"** to see the rewritten version and compare it with the original.

---

## 🌐 Live Demo

You can view the live frontend application here:  
**[🔗 View Live Application](http://localhost:3000)**  
*(Note: Since this is a local setup, the link refers to your local instance)*

---