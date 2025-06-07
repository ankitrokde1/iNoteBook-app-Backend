# iNoteBook-app-Backend

This is the backend API for the iNoteBook application, built with Node.js, Express, and MongoDB.  
It provides authentication, note management, and password reset functionality.

## Features

- User registration and login (JWT & cookies)
- Secure password hashing
- CRUD operations for notes
- Password reset via email
- CORS support for frontend integration

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB database (local or cloud)
- [Optional] Nodemailer SMTP credentials for email features

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/iNoteBook-app-Backend.git
   cd iNoteBook-app-Backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.

4. **Start the server:**
   ```sh
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

## API Endpoints

### Auth

- `POST /api/auth/createuser` — Register a new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/getuser` — Get logged-in user details
- `POST /api/auth/logout` — Logout user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password/:token` — Reset password

### Notes

- `GET /api/notes/fetchallnotes` — Get all notes for user
- `POST /api/notes/addnote` — Add a new note
- `PUT /api/notes/updatenote/:id` — Update a note
- `DELETE /api/notes/deletenote/:id` — Delete a note

## Folder Structure

```
controllers/      # Route logic
middleware/       # Custom middleware
models/           # Mongoose models
routes/           # Express route definitions
utils/            # Utility functions (e.g., email)
index.js          # Entry point
db.js             # MongoDB connection
.env.example      # Example environment variables
```
