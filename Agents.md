# Agent Documentation

This document provides a technical overview of the Cool Wind Services portfolio website project for AI agents.

## Project Overview

This is a comprehensive portfolio website for "Cool Wind Services," an appliance repair and sales business. The project is built with Next.js 14 and TypeScript, featuring a modern, responsive, and mobile-first design. It is internationalized to support both English and Malayalam.

The application includes a customer-facing portfolio, service descriptions, and an AI-powered chat widget for user interaction. It also features a secure admin dashboard for managing business operations, including tasks and customer inquiries.

## Core Technologies

*   **Framework:** Next.js 14 (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Internationalization:** `next-intl`
*   **Forms:** React Hook Form with Zod for validation
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Backend/DB:** Supabase (for admin features, tasks, etc.)
*   **AI:** Gemini API for chat and information extraction.

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and populate it with the necessary keys, especially for Supabase and other external services.

```bash
cp .env.example .env.local
```

### 3. Running the Development Server

```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 4. Linting

Run the linter to check for code quality issues.

```bash
npm run lint
```

## Key Directory Structure

*   `app/`: Main application directory using the Next.js App Router.
    *   `app/[locale]/`: Localized pages for `en` (English) and `ml` (Malayalam).
    *   `app/admin/`: Contains the admin dashboard UI and related components.
    *   `app/api/`: API routes for backend functionality (contact forms, chat, admin tasks).
*   `components/`: Shared, reusable React components.
    *   `components/admin/`: Components specific to the admin dashboard.
    *   `components/chat/`: Components for the AI chat widget.
*   `data/`: Static data and translations.
    *   `data/translations/`: Contains `en.json` and `ml.json` for i18n.
    *   `*.json`: Other static data (testimonials, services).
*   `lib/`: Core application logic, utilities, and third-party service integrations.
    *   `lib/gemini/`: Gemini API client and information extraction logic.
    *   `lib/chat/`: Contains the core logic for the AI chat agent, including business logic, state management, and task detection.
    *   `lib/supabase/`: Supabase client and server-side helpers.
*   `sql/`: SQL scripts for database schema setup and migrations.
*   `scripts/`: Various Node.js scripts for testing, seeding data, and validation.

## Core Features & Implementation

### Internationalization (i18n)

-   Managed by `next-intl`.
-   URL-based routing is handled by `middleware.ts`.
-   All user-facing strings must be added to `data/translations/en.json` and `data/translations/ml.json`.
-   Use the `useTranslations` hook from `next-intl` in components to access translated text.

### AI-Powered Chat Agent

-   **Entry Point:** The API logic starts at `app/api/chat/route.ts`.
-   **Core Logic:** The main orchestration logic is in `lib/chat/`.
    -   `intelligent-message-analyzer.ts`: Analyzes user messages to determine intent.
    -   `failed-call-detector.ts`: Detects if a user's request could be a "failed call" (e.g., an urgent, unresolved issue).
    -   `task-management-agent.ts`: Identifies when a user's request should become a task for the admin.
-   **Gemini Integration:** The client for interacting with the Gemini API is located in `lib/gemini/client.ts`.
-   **Frontend:** The chat UI is built with components found in `components/chat/` and the main `ChatWidget.tsx`.

### Admin Dashboard & Backend

-   **Access:** The admin dashboard is at `/admin`. Authentication is required.
-   **UI:** Components are located in `app/admin/` and `components/admin/`.
-   **API Routes:** Backend logic for admin actions is in `app/api/admin/`.
-   **Database:** Supabase is used for the database.
    -   The schema is defined in the `sql/` directory.
    -   The Supabase client is configured in `lib/supabase/client.ts`.

### Testing

-   The project contains several scripts in the `scripts/` directory for testing specific functionalities (e.g., `test-chat.js`, `test-admin-task-api.js`).
-   There is no formal automated testing framework like Jest or Playwright configured. Testing is primarily done via these scripts and manual verification.
-   `test-carousel-dom.js` and `test-carousel.js` are specific tests for the testimonial carousel component.
