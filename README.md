# Project Website

This project is built with [Next.js](https://nextjs.org/) and was originally created using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Current Status

> **Note:** Some features of this website are currently unavailable.

This project uses **Supabase** for backend services such as database functionality and other dynamic features. My Supabase subscription for this project has been cancelled, so the associated Supabase projects are currently **frozen**.

As a result, features that rely on Supabase may not work as expected. The frontend and other parts of the application can still be viewed, but the website should not be considered fully functional in its current deployed state.

The Supabase-dependent functionality can be restored by reactivating or migrating the backend services.

## Getting Started

To run the project locally, install the dependencies and start the development server:

```bash
npm install
npm run dev
```

You can also use:

```bash
yarn dev
# or
pnpm dev
# or
bun dev
```

Open `http://localhost:3000` in your browser to view the application.

## Tech Stack

* Next.js
* React
* TypeScript
* Supabase
* Vercel

## Development

The application uses the Next.js App Router. The main page can be edited in:

```text
app/page.tsx
```

Changes will automatically update while the development server is running.

## Deployment

The application can be deployed using [Vercel](https://vercel.com/), which provides native support for Next.js applications.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

