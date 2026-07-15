# Favorite Quotes

A simple Node.js app that stores and searches your favorite quotes using Postgres (Neon).

## Features

- Add quotes and optional authors
- Search quotes by quote text or author
- Blue themed responsive UI
- Automatic database table creation on startup

## Requirements

- Node.js 24.16.0
- A Neon Postgres database URL

## Setup

1. Install dependencies:

   npm install

2. Copy env file and set your Neon connection string:

   cp .env.example .env

3. Edit `.env`:

   DATABASE_URL=your_neon_connection_string
   PORT=3000

4. Start app:

   npm start

5. Open:

   http://localhost:3000

## Notes for Namecheap Shared Hosting

- Set environment variable `DATABASE_URL` in your hosting panel.
- Ensure your Node app startup command points to `src/server.js`.
- Set the Node.js runtime version to `24.16.0`.
