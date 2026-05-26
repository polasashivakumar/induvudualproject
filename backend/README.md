# Backend

This folder contains the Express, MongoDB, and worker logic for the distributed task queue.

## Features

- JWT authentication with student and admin roles
- task/job creation and lifecycle management
- file upload and download support
- AI task suggestion endpoint
- background worker that processes queued jobs
- email notification helpers

## Folder Structure

```text
backend/
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── Job.js
│   └── User.js
├── routes/
│   ├── ai.js
│   ├── auth.js
│   ├── jobs.js
│   └── upload.js
├── uploads/
├── utils/
│   └── emailService.js
├── db.js
├── queue.js
├── server.js
├── worker.js
├── createAdmin.js
├── fixdb.js
├── fixdb2.js
└── package.json
```

## Setup

1. Install dependencies.
2. Create a `.env` file in this folder.
3. Add your MongoDB connection string and other required secrets.
4. Start the server.

## Environment Variables

Required variables are:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `GROQ_API_KEY`

## Available Scripts

The current `package.json` only includes the default test placeholder. Typical local commands are:

- `node server.js` to run the API
- `node worker.js` if you want to start the worker separately

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/jobs/my`
- `GET /api/jobs/all`
- `GET /api/jobs/stats`
- `POST /api/jobs/submit`
- `POST /api/upload`
- `POST /api/ai/suggest`

The backend also serves uploaded files from `/uploads`.