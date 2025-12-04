# Gemini Context: NDI 2025 Server

This `GEMINI.md` file provides context for the Gemini CLI agent working on the NDI (Nuit de l'Info) 2025 server project.

## 1. Project Overview

**Name:** NDI 2025 Server (NIRD Initiative)
**Goal:** A web application promoting digital sovereignty, capable of simulating a Windows-like desktop environment ("Windows 93" style) with mini-apps and a gamified task system.
**Tech Stack:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Templating:** EJS (Embedded JavaScript templates)
*   **Frontend:** Alpine.js (interactivity), Tailwind CSS + DaisyUI (styling)
*   **Containerization:** Docker & Docker Compose

## 2. Building and Running

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm start` | Starts the server on port 3000 (via `bin/www`). |
| **Build CSS** | `npm run build:css` | Compiles Tailwind CSS to `public/stylesheets/style.css`. |
| **Watch CSS** | `npm run watch:css` | Recompiles CSS on file changes. |
| **Docker Run** | `docker-compose up -d` | Starts the app in production mode. |

**Environment Variables:**
*   `PORT`: Server port (default: 3000)
*   `BASE_PATH`: Base URL path for the application (e.g., `/ndi` or `/`). Default is `/` in Docker.

## 3. Project Structure & Architecture

### Key Directories
*   `bin/www`: Server entry point and HTTP server creation.
*   `app.js`: Main Express application setup (middleware, view engine).
*   `config/`: Configuration files.
    *   `theme.js`: Centralized design tokens and color palette.
*   `public/`: Static assets.
    *   `stylesheets/input.css`: Source Tailwind CSS file.
    *   `javascripts/`: Client-side logic.
        *   `windows-manager.js`: Core logic for the desktop simulation (Alpine store).
        *   `message-bus.js`: `postMessage` wrapper for iframe communication.
*   `routes/`: Express route definitions.
*   `views/`: EJS templates.
    *   `windows.ejs`: The main desktop container.
    *   `apps/`: Templates for mini-apps (loaded via iframe).
    *   `partials/`: Reusable components (navbar, footer).

### URL & Path Handling
*   The app uses a `basePath` local variable in views to support running behind a reverse proxy/load balancer.
*   **Helpers:** `utils/helpers.js` provides functions to generate correct paths.

## 4. The "Windows" Simulation System

The project features a complex desktop simulation available at the `/windows` route.

**Core Components:**
1.  **Window Manager (`public/javascripts/windows-manager.js`):**
    *   An Alpine.js store (`Alpine.store('wm')`).
    *   Manages: Open windows, task progress, unlocked apps, and z-indices.
    *   **Registry:** Contains `APPS` (definitions) and `TASKS` (gamification logic).
2.  **Mini-Apps (Iframes):**
    *   Each "app" (e.g., Snake, Typing Test) runs in an isolated `<iframe>`.
    *   They communicate with the parent window using the `message-bus.js` utility.
3.  **Task System:**
    *   Users unlock new apps by completing tasks (e.g., "Score 100 points in Snake").
    *   Events are emitted from iframes -> caught by parent -> checked against `TASKS` conditions.

**Adding a New App:**
1.  Define the app in `windows-manager.js` (ID, name, icon, route).
2.  Create the Express route in `routes/index.js`.
3.  Create the EJS view in `views/apps/`.
4.  (Optional) Define associated tasks in `windows-manager.js` to unlock it.

## 5. Development Conventions

*   **Styling:** Use utility classes (Tailwind) primarily. Edit `public/stylesheets/input.css` for custom layers.
*   **JavaScript:**
    *   Use **Alpine.js** for DOM manipulation and state management in views.
    *   Use **JSDoc** for function documentation.
    *   Communication between iframes and parent MUST use the `message-bus.js` protocol.
*   **Language:** User-facing text should be in **French**.
