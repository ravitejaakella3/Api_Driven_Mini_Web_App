# API-Driven Mini Web App

Simple full-stack app that fetches GitHub repos for a username, stores them in MongoD and shows results in a frontend dashboard.

## Features
- Search GitHub by username (frontend form).
- Backend fetches repos from GitHub and saves to MongoDB.
- Frontend displays stored repos with simple pagination.
- Basic error handling (404 when GitHub user not found).

## Repo structure
- backend/ — Express + Mongoose API (server.js)
- frontend/ — React app (src/App.js)

## Prerequisites
- Node.js (16+ recommended)
- npm
- MongoDB running locally or a hosted MongoDB URI

## Environment (.env)
Create a `.env` in `backend/` with at least:
```env
MONGO_URI=mongodb://localhost:27017/mini_web_db
PORT=3000
```

## Install & Run (Windows)
Open two terminals.

1) Backend
```powershell
cd d:\API_Driven_Mini_Web_App\backend
npm install
# start
node server.js
```

2) Frontend
```powershell
cd d:\API_Driven_Mini_Web_App\frontend
npm install
npm start
```
