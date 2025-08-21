# Project Overview

This is a comprehensive portfolio website for "Cool Wind Services," an appliance repair and sales business. The project is built with Next.js 14 and TypeScript, featuring a modern, responsive, and mobile-first design. It is internationalized to support both English and Malayalam.

## Key Technologies

*   **Framework:** Next.js 14 (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Internationalization:** `next-intl`
*   **Forms:** React Hook Form with Zod for validation
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

## Project Structure

The project is organized into the following key directories:

*   `app/`: Contains the Next.js App Router pages, including localized routes.
*   `components/`: Reusable React components.
*   `data/`: Static data, including site configuration and translations.
*   `lib/`: Utility functions and helpers.
*   `styles/`: Global CSS and Tailwind CSS configuration.
*   `public/`: Static assets.

# Building and Running

## Prerequisites

*   Node.js 18+
*   npm or yarn

## Installation and Execution

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Copy `.env.example` to `.env.local` and fill in the required values.
    ```bash
    cp .env.example .env.local
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

5.  **Start the production server:**
    ```bash
    npm run start
    ```

6.  **Lint the code:**
    ```bash
    npm run lint
    ```

# Development Conventions

*   **Coding Style:** The project follows standard Next.js and TypeScript conventions. ESLint is used for linting.
*   **Testing:** The `manual-test-instructions.md` file provides guidance on how to manually test the testimonial carousel. While there are no automated tests in the provided file structure, the presence of testing-related files (`simple-test.js`, `test-carousel-dom.js`, `test-carousel.js`) suggests that testing is a consideration for this project.
*   **Internationalization:** All user-facing text should be added to the translation files in `data/translations` and accessed using the `useTranslations` hook from `next-intl`.
*   **Components:** Create reusable components in the `components` directory and keep them focused on a single responsibility.
