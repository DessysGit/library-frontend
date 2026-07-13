# Library Management System - Frontend

Vanilla JavaScript frontend for the Des2 Library Management System. Provides the user interface for browsing books, authentication, reviews, and admin dashboard.

![Bootstrap](https://img.shields.io/badge/Bootstrap-4-blue)
![Chart.js](https://img.shields.io/badge/Chart.js-latest-orange)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Pages](#pages)
- [Deployment](#deployment)

---

## Features

### For Users
- **Browse & Search Books** — Search by title, author, and genre
- **Review & Rate Books** — Submit 1-5 star ratings
- **Like / Dislike Books** — Quick reactions
- **AI Recommendations** — Personalized suggestions
- **Chatbot Assistant** — Interactive book finder
- **Download Books** — Access PDF versions
- **User Profile** — Activity feed, reviews, preferences, password change

### For Admins
- **Analytics Dashboard** — Charts and statistics
- **Book Management** — Add/edit/delete books with file upload
- **User Management** — View users, grant/revoke admin

---

## Tech Stack

- **UI:** Vanilla JavaScript (ES2020+), HTML5, CSS3
- **Styling:** Bootstrap 4, Font Awesome
- **Charts:** Chart.js
- **Design:** Responsive, mobile-first, dark theme

---

## Quick Start

### Prerequisites
- Backend API running (see backend README)

### Run Locally

Serve the files with any static server:

```bash
# Using VS Code Live Server extension
# Or using a simple HTTP server:
npx serve public

# Or using Python:
python -m http.server 8000 --directory public
```

Then open `http://localhost:8000` (or your chosen port).

---

## Configuration

### API Base URL

Set the backend URL in these files:

| File | Line |
|---|---|
| `script.js` | `const API_BASE_URL = '...'` |
| `auth.js` | `const API_BASE_URL = '...'` |
| `admin-dashboard.js` | `const API_BASE_URL = '...'` |

Default in production: `https://library-backend-j90e.onrender.com`

Update to point to your deployed backend, or leave empty for local development.

---

## Pages

| Page | Description |
|---|---|
| `auth.html` | Login and registration |
| `index.html` | Main app - book search and browsing |
| `admin-dashboard.html` | Admin analytics and user management |
| `book-details.html` | Book details, reviews, download |
| `reset-password.html` | Password reset form |

---

## Directory Structure

```
public/
├── auth.html / auth.js          # Auth pages
├── index.html / script.js       # Main application
├── admin-dashboard.html/.js     # Admin dashboard
├── book-details.html            # Book details page
├── reset-password.html          # Password reset
├── style.css                    # Global styles
└── chatbot/                     # Chatbot widget
    ├── chat.js
    └── chat.css
```

---

## Deployment

### Netlify

1. Connect this repository to Netlify
2. **Publish Directory:** `public`
3. **Build Command:** (leave empty)
4. Deploy!

No build step needed — it's static HTML/CSS/JS.

---

## Notes

- All API calls require the backend to be running
- JWT authentication handled automatically via localStorage
- Toast notifications replace all browser dialogs
- File uploads: PDFs go to Google Cloud Storage, covers to Cloudinary

---

*Deployed automatically from this repository.