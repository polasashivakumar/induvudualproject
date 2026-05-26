# Distributed Task Queue

A MERN-based distributed task queue for college workflows. This repository contains the backend API, frontend app, and supporting documentation.

## Folder Structure

```text
induvudualproject/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   ├── worker.js
│   ├── queue.js
│   └── package.json
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       └── package.json
└── README.md
```

## Backend

The backend is an Express + MongoDB API that supports:

- JWT authentication
- student and admin role-based access
- task submission and status updates
- file uploads and downloads
- AI-powered task suggestions
- background job processing

## Frontend

The frontend is a Vite + React app with:

- login and registration pages
- student and admin dashboards
- analytics, notifications, progress widgets, and AI task suggestions
- theme switching and language switching

## Run Locally

1. Install dependencies in `backend/` and `frontend/`.
2. Make sure MongoDB is running.
3. Start the backend server.
4. Start the frontend development server.

## Notes

- Frontend API base URL: `http://localhost:5000/api`
- Backend serves uploads from `/uploads`
