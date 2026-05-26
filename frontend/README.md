# Frontend

This folder contains the React + Vite user interface for the distributed task queue.

## Features

- login and registration pages
- protected dashboard routing
- student and admin dashboard layouts
- task submission, notifications, analytics, and progress widgets
- theme switching and language switching
- AI task suggestion flow

## Folder Structure

```text
frontend/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── manifest.json
└── src/
	├── api/
	│   └── axios.js
	├── components/
	├── context/
	│   ├── AuthContext.jsx
	│   └── ThemeContext.jsx
	├── pages/
	│   ├── Dashboard.jsx
	│   ├── Login.jsx
	│   └── Register.jsx
	├── App.css
	├── App.jsx
	├── i18n.js
	├── index.css
	└── main.jsx
```

## Setup

1. Install dependencies.
2. Make sure the backend is running on `http://localhost:5000`.
3. Start the frontend development server.

## Available Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build

## API Connection

The frontend uses a shared Axios client in [src/api/axios.js](src/api/axios.js) with the API base URL set to `http://localhost:5000/api`.
